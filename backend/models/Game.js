import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema(
  {
    playerX: {
      type: String,
      required: [true, 'Player X name is required'],
      trim: true
    },
    playerO: {
      type: String,
      required: [true, 'Player O name is required'],
      trim: true
    },
    userX: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    userO: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    board: {
      type: [
        {
          type: String,
          enum: ['', 'X', 'O'],
          default: ''
        }
      ],
      default: () => Array(9).fill(''),
      validate: [
        {
          validator: function (arr) {
            return arr.length === 9;
          },
          message: 'The game board must contain exactly 9 cells.'
        }
      ]
    },
    winner: {
      type: String,
      enum: ['X', 'O', null],
      default: null
    },
    status: {
      type: String,
      enum: ['playing', 'won', 'draw'],
      default: 'playing'
    },
    currentPlayer: {
      type: String,
      enum: ['X', 'O'],
      default: 'X'
    }
  },
  {
    timestamps: true // Automatically creates createdAt and updatedAt timestamps
  }
);

// Index status and createdAt for optimized game history & scoreboard querying
gameSchema.index({ status: 1, createdAt: -1 });

const Game = mongoose.model('Game', gameSchema);

export default Game;
