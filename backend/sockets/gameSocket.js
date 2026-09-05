import Game from '../models/Game.js';

// In-memory store for active online multiplayer game rooms
const rooms = new Map();

// All 8 winning line combinations for 3x3 Tic Tac Toe
const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

// Helper function to check winner on backend board state
function checkWinner(board) {
  for (const [a, b, c] of WINNING_COMBINATIONS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a, b, c] };
    }
  }
  return null;
}

// Generate random 6-character room code
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default function initGameSocket(io) {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // 1. Create Online Room (Player X)
    socket.on('createRoom', ({ name, userId }) => {
      let roomCode = generateRoomCode();
      while (rooms.has(roomCode)) {
        roomCode = generateRoomCode();
      }

      const newRoom = {
        roomCode,
        status: 'waiting',
        board: Array(9).fill(''),
        currentPlayer: 'X',
        playerX: {
          socketId: socket.id,
          userId: userId || null,
          name: name && name.trim() ? name.trim() : 'Player X'
        },
        playerO: null,
        winner: null,
        winningLine: []
      };

      rooms.set(roomCode, newRoom);
      socket.join(roomCode);

      socket.emit('roomCreated', {
        roomCode,
        game: newRoom
      });
    });

    // 2. Join Online Room (Player O)
    socket.on('joinRoom', ({ roomCode, name, userId }) => {
      const code = roomCode ? roomCode.trim().toUpperCase() : '';
      const room = rooms.get(code);

      if (!room) {
        socket.emit('error', { message: 'Room code not found. Please check code.' });
        return;
      }

      if (room.status !== 'waiting' || room.playerO) {
        socket.emit('error', { message: 'Room is full or game is already in progress.' });
        return;
      }

      room.playerO = {
        socketId: socket.id,
        userId: userId || null,
        name: name && name.trim() ? name.trim() : 'Player O'
      };
      room.status = 'playing';

      socket.join(code);

      io.to(code).emit('playerJoined', { playerO: room.playerO });
      io.to(code).emit('gameUpdated', room);
    });

    // 3. Make Move Event
    socket.on('makeMove', async ({ roomCode, index, player }) => {
      const code = roomCode ? roomCode.trim().toUpperCase() : '';
      const room = rooms.get(code);

      if (!room) {
        socket.emit('error', { message: 'Room not found.' });
        return;
      }

      if (room.status !== 'playing') {
        socket.emit('error', { message: 'Game is not currently active.' });
        return;
      }

      if (room.currentPlayer !== player) {
        socket.emit('error', { message: `It is currently Player ${room.currentPlayer}'s turn.` });
        return;
      }

      // Verify moving socket matches the active player
      const expectedSocketId = player === 'X' ? room.playerX?.socketId : room.playerO?.socketId;
      if (expectedSocketId && expectedSocketId !== socket.id) {
        socket.emit('error', { message: 'Unauthorized move for this player slot.' });
        return;
      }

      // Cell occupancy check
      const cellIdx = Number(index);
      if (isNaN(cellIdx) || cellIdx < 0 || cellIdx > 8 || room.board[cellIdx] !== '') {
        socket.emit('error', { message: 'Cell is already occupied or invalid.' });
        return;
      }

      // Apply move to backend source of truth
      room.board[cellIdx] = player;

      // Check for winner / draw
      const winResult = checkWinner(room.board);

      if (winResult) {
        room.status = 'won';
        room.winner = winResult.winner;
        room.winningLine = winResult.line;

        // Save completed online game to MongoDB
        try {
          await Game.create({
            playerX: room.playerX.name,
            playerO: room.playerO ? room.playerO.name : 'Player O',
            userX: room.playerX.userId || null,
            userO: room.playerO ? room.playerO.userId : null,
            board: room.board,
            winner: winResult.winner,
            status: 'won'
          });
        } catch (dbErr) {
          console.error('Failed to save online game to DB:', dbErr.message);
        }

        io.to(code).emit('gameWon', { winner: winResult.winner, line: winResult.line, game: room });
        io.to(code).emit('gameUpdated', room);
      } else if (!room.board.includes('')) {
        room.status = 'draw';
        room.winner = null;

        try {
          await Game.create({
            playerX: room.playerX.name,
            playerO: room.playerO ? room.playerO.name : 'Player O',
            userX: room.playerX.userId || null,
            userO: room.playerO ? room.playerO.userId : null,
            board: room.board,
            winner: null,
            status: 'draw'
          });
        } catch (dbErr) {
          console.error('Failed to save online draw game to DB:', dbErr.message);
        }

        io.to(code).emit('gameDraw', { game: room });
        io.to(code).emit('gameUpdated', room);
      } else {
        // Toggle turn
        room.currentPlayer = player === 'X' ? 'O' : 'X';
        io.to(code).emit('gameUpdated', room);
      }
    });

    // 4. Leave Room Event
    socket.on('leaveRoom', ({ roomCode }) => {
      const code = roomCode ? roomCode.trim().toUpperCase() : '';
      const room = rooms.get(code);

      if (room) {
        if (room.status === 'playing') {
          room.status = 'abandoned';
        }
        io.to(code).emit('playerDisconnected', { message: 'A player left the game.' });
        socket.leave(code);

        // Cleanup empty rooms
        if (room.playerX?.socketId === socket.id) room.playerX = null;
        if (room.playerO?.socketId === socket.id) room.playerO = null;

        if (!room.playerX && !room.playerO) {
          rooms.delete(code);
        } else {
          io.to(code).emit('gameUpdated', room);
        }
      }
    });

    // 5. Socket Disconnection Handler
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      rooms.forEach((room, code) => {
        if (room.playerX?.socketId === socket.id || room.playerO?.socketId === socket.id) {
          if (room.status === 'playing') {
            room.status = 'abandoned';
          }
          io.to(code).emit('playerDisconnected', {
            message: 'Opponent disconnected from the server.'
          });

          if (room.playerX?.socketId === socket.id) room.playerX = null;
          if (room.playerO?.socketId === socket.id) room.playerO = null;

          if (!room.playerX && !room.playerO) {
            rooms.delete(code);
          } else {
            io.to(code).emit('gameUpdated', room);
          }
        }
      });
    });
  });
}
