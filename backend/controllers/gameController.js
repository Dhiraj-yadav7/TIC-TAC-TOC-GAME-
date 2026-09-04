import mongoose from 'mongoose';
import Game from '../models/Game.js';

// Winning combinations for Tic Tac Toe
const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

// Helper function to check for a winner
const checkWinner = (board) => {
  for (const [a, b, c] of WINNING_COMBINATIONS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a]; // Returns 'X' or 'O'
    }
  }
  return null;
};

// 1. Start a new game - POST /api/games
export const createGame = async (req, res) => {
  try {
    const { playerX, playerO } = req.body || {};

    // Validate player names
    if (!playerX || typeof playerX !== 'string' || !playerX.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Player X name is required'
      });
    }

    if (!playerO || typeof playerO !== 'string' || !playerO.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Player O name is required'
      });
    }

    const game = new Game({
      playerX: playerX.trim(),
      playerO: playerO.trim()
    });
    await game.save();

    return res.status(201).json({
      success: true,
      message: 'New game started successfully',
      data: game
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create game',
      error: error.message
    });
  }
};

// 2. Get a game by ID - GET /api/games/:id
export const getGameById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Game ID format'
      });
    }

    const game = await Game.findById(id);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: game
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch game',
      error: error.message
    });
  }
};

// 3. Make a move - PUT /api/games/:id/move
export const makeMove = async (req, res) => {
  try {
    const { id } = req.params;
    const { index, cellIndex, player } = req.body || {};

    // Validate Game ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Game ID format'
      });
    }

    // Support both 'index' and 'cellIndex' parameter names
    const targetIndex = index !== undefined ? Number(index) : cellIndex !== undefined ? Number(cellIndex) : undefined;

    // Validate cell index (must be an integer between 0 and 8)
    if (targetIndex === undefined || isNaN(targetIndex) || !Number.isInteger(targetIndex) || targetIndex < 0 || targetIndex > 8) {
      return res.status(400).json({
        success: false,
        message: 'Cell index must be an integer between 0 and 8'
      });
    }

    // Find game in database
    const game = await Game.findById(id);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    // Prevent move if game is already finished
    if (game.status !== 'playing') {
      return res.status(400).json({
        success: false,
        message: `Game is already finished with status: '${game.status}'`
      });
    }

    // Validate player turn if specified in request body
    if (player && player !== game.currentPlayer) {
      return res.status(400).json({
        success: false,
        message: `It is currently ${game.currentPlayer}'s turn`
      });
    }

    // Prevent move on an occupied cell
    if (game.board[targetIndex] !== '') {
      return res.status(400).json({
        success: false,
        message: 'Cell is already occupied'
      });
    }

    // Perform move for current player
    const movingPlayer = game.currentPlayer;
    game.board[targetIndex] = movingPlayer;
    game.markModified('board');

    // Check for winner after move
    const winningPlayer = checkWinner(game.board);

    if (winningPlayer) {
      game.status = 'won';
      game.winner = winningPlayer;
    } else if (!game.board.includes('')) {
      // Check for draw
      game.status = 'draw';
      game.winner = null;
    } else {
      // Switch player turn
      game.currentPlayer = movingPlayer === 'X' ? 'O' : 'X';
    }

    await game.save();

    return res.status(200).json({
      success: true,
      message: game.status === 'won'
        ? `Player ${winningPlayer === 'X' ? game.playerX : game.playerO} won!`
        : game.status === 'draw'
        ? 'Game ended in a draw!'
        : 'Move recorded successfully',
      data: game
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to record move',
      error: error.message
    });
  }
};

// 4. Reset game - POST /api/games/:id/reset
export const resetGame = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate Game ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Game ID format'
      });
    }

    const game = await Game.findById(id);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    // Reset game state back to initial values while preserving player names
    game.board = Array(9).fill('');
    game.status = 'playing';
    game.winner = null;
    game.currentPlayer = 'X';

    game.markModified('board');
    await game.save();

    return res.status(200).json({
      success: true,
      message: 'Game reset successfully',
      data: game
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to reset game',
      error: error.message
    });
  }
};

// 5. Get recent game history - GET /api/games/history
export const getGameHistory = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 10, 50);

    const history = await Game.find({
      status: { $in: ['won', 'draw'] }
    })
      .select('playerX playerO winner status createdAt')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch game history',
      error: error.message
    });
  }
};

// 6. Get aggregate game statistics - GET /api/games/stats
export const getGameStats = async (req, res) => {
  try {
    const [xWins, oWins, draws] = await Promise.all([
      Game.countDocuments({ status: 'won', winner: 'X' }),
      Game.countDocuments({ status: 'won', winner: 'O' }),
      Game.countDocuments({ status: 'draw' })
    ]);

    return res.status(200).json({
      success: true,
      data: {
        xWins,
        oWins,
        draws
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch game statistics',
      error: error.message
    });
  }
};
