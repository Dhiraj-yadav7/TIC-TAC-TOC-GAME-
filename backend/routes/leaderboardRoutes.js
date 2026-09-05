import express from 'express';
import { getLeaderboard } from '../controllers/leaderboardController.js';

const router = express.Router();

// GET /api/leaderboard - Get global registered users leaderboard
router.get('/leaderboard', getLeaderboard);

export default router;
