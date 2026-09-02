import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tictactoe';

// Configure CORS middleware
app.use(cors());

// Configure JSON middleware
app.use(express.json());

// Connect to MongoDB using Mongoose
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('Successfully connected to MongoDB.');
  } catch (err) {
    console.log('MongoDB connection note:', err.message);
  }
};

connectDB();

// GET /api/health route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running'
  });
});

// Start Express server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
