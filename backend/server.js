import http from 'http';
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import dns from 'dns';
import { Server } from 'socket.io';

// Configure DNS servers for reliable SRV resolution on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
  dns.setDefaultResultOrder('ipv4first');
} catch (err) {
  console.warn('DNS server override failed, using default system DNS:', err.message);
}

import gameRoutes from './routes/gameRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import initGameSocket from './sockets/gameSocket.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tictactoe';
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || '*';

// Parse allowed origins (supports wildcard, local dev origins, or comma-separated origins)
const allowedOrigins = CLIENT_ORIGIN === '*'
  ? '*'
  : CLIENT_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin || allowedOrigins === '*') return true;
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  return Array.isArray(allowedOrigins) && allowedOrigins.includes(origin);
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS policy does not allow access from origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Create HTTP Server & Socket.IO Instance
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Initialize Socket.IO Online Multiplayer Handlers
initGameSocket(io);

// Configure CORS
app.use(cors(corsOptions));

// Express JSON Body Parser
app.use(express.json());

// Welcome root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Tic Tac Toe Backend API is running with Socket.IO!',
    frontendUrl: CLIENT_ORIGIN !== '*' ? CLIENT_ORIGIN : 'http://localhost:5173',
    healthCheck: '/api/health',
    endpoints: [
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/me',
      'GET /api/users/me/stats',
      'GET /api/leaderboard',
      'POST /api/games',
      'GET /api/games/:id',
      'PUT /api/games/:id/move',
      'POST /api/games/:id/reset',
      'GET /api/games/history',
      'GET /api/games/stats'
    ]
  });
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api', leaderboardRoutes);
app.use('/api', gameRoutes);

// Server Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Tic Tac Toe Server is running',
    timestamp: new Date().toISOString()
  });
});

// Database Health check endpoint
app.get('/api/health/db', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  const dbName = mongoose.connection.name || 'tictactoe';

  if (isConnected) {
    return res.status(200).json({
      success: true,
      message: 'MongoDB connection is working',
      database: dbName
    });
  }

  return res.status(503).json({
    success: false,
    message: 'MongoDB connection is not available'
  });
});

// Global 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, _next) => {
  console.error('Unhandled Server Error:', err.message || err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
  }
};

connectDB();

// Start HTTP server with Socket.IO attached
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown handler
const gracefulShutdown = async () => {
  console.log('\nShutdown signal received. Closing server and MongoDB connection...');
  server.close(async () => {
    try {
      await mongoose.connection.close();
      console.log('Server and database connection closed cleanly.');
      process.exit(0);
    } catch (err) {
      console.error('Error during database disconnection:', err.message);
      process.exit(1);
    }
  });
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

