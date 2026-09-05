import http from 'http';
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { Server } from 'socket.io';
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

// Create HTTP Server & Socket.IO Instance
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: CLIENT_ORIGIN === '*' ? '*' : CLIENT_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Initialize Socket.IO Online Multiplayer Handlers
initGameSocket(io);

// Configure CORS
app.use(
  cors({
    origin: CLIENT_ORIGIN === '*' ? '*' : CLIENT_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Express JSON Body Parser
app.use(express.json());

// Welcome root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Tic Tac Toe Backend API is running with Socket.IO!',
    frontendUrl: 'http://localhost:5173',
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Tic Tac Toe Server is running',
    timestamp: new Date().toISOString()
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
  console.error('Unhandled Server Error:', err);
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
    console.log('Successfully connected to MongoDB.');
  } catch (err) {
    console.warn('MongoDB connection note:', err.message);
  }
};

connectDB();

// Start Express server
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Graceful shutdown handler
const gracefulShutdown = async () => {
  console.log('\nShutdown signal received. Closing server and MongoDB connection...');
  server.close(async () => {
    await mongoose.connection.close();
    console.log('Server and database connection closed cleanly.');
    process.exit(0);
  });
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
