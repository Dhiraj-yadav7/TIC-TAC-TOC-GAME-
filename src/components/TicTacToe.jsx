import { useState } from "react";
import Board from "./Board";

// All 8 winning line index combinations on a 3x3 grid
const WINNING_COMBINATIONS = [
  // 3 Rows
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  // 3 Columns
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  // 2 Diagonals
  [0, 4, 8],
  [2, 4, 6],
];

// Helper function to check for a winner
function calculateWinner(board) {
  for (let i = 0; i < WINNING_COMBINATIONS.length; i++) {
    const [a, b, c] = WINNING_COMBINATIONS[i];
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a, b, c] };
    }
  }
  return null;
}

export default function TicTacToe() {
  // 1. Maintain 3x3 board state (initialized with 9 empty cells)
  const [board, setBoard] = useState(Array(9).fill(null));

  // 2. Track current player turn ('X' starts first)
  const [isXNext, setIsXNext] = useState(true);

  // Check if someone has won or if it's a draw
  const winningInfo = calculateWinner(board);
  const winner = winningInfo ? winningInfo.winner : null;
  const winningLine = winningInfo ? winningInfo.line : [];
  const isDraw = !winner && board.every((cell) => cell !== null);

  // Handle click on a board cell
  const handleClick = (index) => {
    // Return early if cell is already filled or game is over (win/draw)
    if (board[index] || winner || isDraw) return;

    // Immutably copy board array and place current player's symbol
    const newBoard = [...board];
    newBoard[index] = isXNext ? "X" : "O";

    // Update state and switch turn
    setBoard(newBoard);
    setIsXNext(!isXNext);
  };

  // Reset game state
  const handleReset = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
  };

  // Status text display logic
  let status;
  if (winner) {
    status = `Winner: Player ${winner} 🎉`;
  } else if (isDraw) {
    status = `Game Draw! 🤝`;
  } else {
    status = `Turn: Player ${isXNext ? "X" : "O"}`;
  }

  return (
    <div className="min-h-screen bg-[#548687] text-white flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      {/* Header */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-wide text-amber-100 mb-4 sm:mb-6 drop-shadow-lg text-center">
        Tic Tac Toe
      </h1>

      {/* Status Banner */}
      <div className="text-2xl sm:text-3xl font-bold text-amber-200 mb-6 sm:mb-8 text-center min-w-[280px]">
        {status}
      </div>

      {/* Game Board Container */}
      <div className="flex flex-col items-center justify-center w-full">
        <Board
          board={board}
          onCellClick={handleClick}
          winningLine={winningLine}
          isGameOver={Boolean(winner || isDraw)}
        />
      </div>

      {/* Reset Button */}
      <button
        type="button"
        onClick={handleReset}
        className="mt-8 sm:mt-10 px-6 sm:px-8 py-3 sm:py-4 bg-[#8a2be2] hover:bg-[#7b24cc] active:bg-[#6c1fb8] text-[#ffe4c4] font-bold text-xl sm:text-2xl rounded-2xl shadow-xl hover:shadow-purple-900/40 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer border-none focus:outline-none focus:ring-4 focus:ring-purple-300"
      >
        Reset Game
      </button>
    </div>
  );
}

