import express from 'express';
import {
  createGame,
  getGameById,
  makeMove,
  resetGame,
  getGameHistory,
  getGameStats
} from '../controllers/gameController.js';
import { optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Start a new game
router.post('/games', optionalProtect, createGame);

// 2. Get recent game history (Registered before /games/:id)
router.get('/games/history', optionalProtect, getGameHistory);

// 3. Get aggregate scoreboard stats (Registered before /games/:id)
router.get('/games/stats', optionalProtect, getGameStats);

// 4. Get a game by ID
router.get('/games/:id', getGameById);

// 5. Make a move
router.put('/games/:id/move', makeMove);

// 6. Reset a game
router.post('/games/:id/reset', resetGame);

export default router;
