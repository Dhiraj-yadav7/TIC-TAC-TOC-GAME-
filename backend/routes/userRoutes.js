import express from 'express';
import { getUserStats } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/users/me/stats - Protected route for authenticated user stats
router.get('/me/stats', protect, getUserStats);

export default router;
