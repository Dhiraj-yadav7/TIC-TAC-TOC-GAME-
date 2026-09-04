import express from 'express';
import {
  createGame,
  getGameById,
  makeMove,
  resetGame
} from '../controllers/gameController.js';

const router = express.Router();

// 1. Start a new game
router.post('/games', createGame);

// 2. Get a game by ID
router.get('/games/:id', getGameById);

// 3. Make a move
router.put('/games/:id/move', makeMove);

// 4. Reset a game
router.post('/games/:id/reset', resetGame);

export default router;
