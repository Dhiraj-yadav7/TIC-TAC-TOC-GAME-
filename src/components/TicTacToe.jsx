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

  // 3. Track total game scores across rounds
  const [scores, setScores] = useState({ x: 0, o: 0, draws: 0 });
  const [hasScoredCurrentGame, setHasScoredCurrentGame] = useState(false);

  // Check if someone has won or if it's a draw
  const winningInfo = calculateWinner(board);
  const winner = winningInfo ? winningInfo.winner : null;
  const winningLine = winningInfo ? winningInfo.line : [];
  const isDraw = !winner && board.every((cell) => cell !== null);

  // Update session scores once when game ends
  if ((winner || isDraw) && !hasScoredCurrentGame) {
    setHasScoredCurrentGame(true);
    if (winner === "X") {
      setScores((prev) => ({ ...prev, x: prev.x + 1 }));
    } else if (winner === "O") {
      setScores((prev) => ({ ...prev, o: prev.o + 1 }));
    } else if (isDraw) {
      setScores((prev) => ({ ...prev, draws: prev.draws + 1 }));
    }
  }

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
    setHasScoredCurrentGame(false);
  };

  // Reset scores back to 0
  const handleResetScores = () => {
    setScores({ x: 0, o: 0, draws: 0 });
    handleReset();
  };

  // Status text display logic strictly per requirements:
  // - Current turn: "Player X's Turn" or "Player O's Turn"
  // - Winner: "Player X Wins!" or "Player O Wins!"
  // - Draw: "It's a Draw!"
  // - Hide turn message after game ends (turn message replaced by winner/draw message)
  let statusText = "";
  let statusStyle = "";

  if (winner) {
    statusText = `Player ${winner} Wins!`;
    statusStyle = winner === "X" 
      ? "bg-teal-500/20 text-teal-300 border-teal-500/40 shadow-teal-500/20 animate-bounce" 
      : "bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-purple-500/20 animate-bounce";
  } else if (isDraw) {
    statusText = "It's a Draw!";
    statusStyle = "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-amber-500/20";
  } else {
    statusText = `Player ${isXNext ? "X" : "O"}'s Turn`;
    statusStyle = isXNext
      ? "bg-slate-800/80 text-teal-300 border-teal-500/30"
      : "bg-slate-800/80 text-purple-300 border-purple-500/30";
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans select-none">
      {/* Header Title */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-teal-300 via-amber-200 to-purple-300 mb-2 drop-shadow-md text-center">
        Tic Tac Toe
      </h1>
      <p className="text-slate-400 text-sm sm:text-base mb-6 font-medium tracking-wide">
        Classic 3x3 Strategy Game
      </p>

      {/* Scoreboard Card */}
      <div className="flex items-center gap-4 sm:gap-6 bg-slate-900/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-slate-800 shadow-xl mb-6 text-sm sm:text-base font-semibold">
        <div className="flex flex-col items-center">
          <span className="text-teal-400">Player X</span>
          <span className="text-xl sm:text-2xl font-bold text-white">{scores.x}</span>
        </div>
        <div className="w-px h-8 bg-slate-700/80" />
        <div className="flex flex-col items-center">
          <span className="text-amber-300">Draws</span>
          <span className="text-xl sm:text-2xl font-bold text-white">{scores.draws}</span>
        </div>
        <div className="w-px h-8 bg-slate-700/80" />
        <div className="flex flex-col items-center">
          <span className="text-purple-400">Player O</span>
          <span className="text-xl sm:text-2xl font-bold text-white">{scores.o}</span>
        </div>
      </div>

      {/* Status Banner */}
      <div className="w-full max-w-[340px] sm:max-w-[420px] md:max-w-[460px] mb-6">
        <div
          className={`py-3.5 px-6 rounded-2xl border backdrop-blur-md shadow-lg text-center text-xl sm:text-2xl font-extrabold tracking-wide transition-all duration-300 ${statusStyle}`}
        >
          {statusText}
        </div>
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

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mt-8">
        <button
          type="button"
          onClick={handleReset}
          className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 text-white font-bold text-lg sm:text-xl rounded-2xl shadow-xl shadow-purple-900/30 hover:shadow-purple-700/50 transition-all duration-200 cursor-pointer border border-purple-400/30 focus:outline-none focus:ring-4 focus:ring-purple-500/50 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reset Game
        </button>

        {(scores.x > 0 || scores.o > 0 || scores.draws > 0) && (
          <button
            type="button"
            onClick={handleResetScores}
            className="px-5 py-3.5 bg-slate-800/80 hover:bg-slate-700/80 active:scale-95 text-slate-300 hover:text-white font-semibold text-sm sm:text-base rounded-2xl border border-slate-700/60 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            Reset Scores
          </button>
        )}
      </div>
    </div>
  );
}


