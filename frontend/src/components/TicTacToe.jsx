import { useState, useEffect, useCallback } from "react";
import Board from "./Board";
import { createGame, makeMove, resetGame } from "../services/api";

// All 8 winning line index combinations on a 3x3 grid for highlight logic
const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

// Helper function to find winning cell indices for UI highlighting
function getWinningLine(board) {
  for (let i = 0; i < WINNING_COMBINATIONS.length; i++) {
    const [a, b, c] = WINNING_COMBINATIONS[i];
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return [a, b, c];
    }
  }
  return [];
}

export default function TicTacToe() {
  // Backend Source of Truth state stored in React
  const [gameId, setGameId] = useState(null);
  const [board, setBoard] = useState(Array(9).fill(""));
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [winner, setWinner] = useState(null);
  const [status, setStatus] = useState("playing");

  // UI state for loading, in-flight API requests, and errors
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Total game scores across sessions
  const [scores, setScores] = useState({ x: 0, o: 0, draws: 0 });
  const [hasScoredCurrentGame, setHasScoredCurrentGame] = useState(false);

  // Sync backend game response object to React state
  const updateGameState = (game) => {
    setGameId(game._id);
    setBoard(game.board);
    setCurrentPlayer(game.currentPlayer);
    setWinner(game.winner);
    setStatus(game.status);
  };

  // 1. Initialize a new game on component mount via POST /api/games
  const initGame = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const game = await createGame();
      updateGameState(game);
      setHasScoredCurrentGame(false);
    } catch (err) {
      setError(err.message || "Failed to start a game. Please ensure the backend server is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Update cumulative session scores when a game ends
  useEffect(() => {
    if ((status === "won" || status === "draw") && !hasScoredCurrentGame) {
      setHasScoredCurrentGame(true);
      if (status === "won" && winner === "X") {
        setScores((prev) => ({ ...prev, x: prev.x + 1 }));
      } else if (status === "won" && winner === "O") {
        setScores((prev) => ({ ...prev, o: prev.o + 1 }));
      } else if (status === "draw") {
        setScores((prev) => ({ ...prev, draws: prev.draws + 1 }));
      }
    }
  }, [status, winner, hasScoredCurrentGame]);

  // Handle move click -> PUT /api/games/:id/move
  const handleClick = async (index) => {
    if (!gameId || board[index] !== "" || status !== "playing" || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);
      const updatedGame = await makeMove(gameId, index, currentPlayer);
      updateGameState(updatedGame);
    } catch (err) {
      setError(err.message || "Failed to make move. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Reset button -> POST /api/games/:id/reset
  const handleReset = async () => {
    if (!gameId) {
      initGame();
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const updatedGame = await resetGame(gameId);
      updateGameState(updatedGame);
      setHasScoredCurrentGame(false);
    } catch (err) {
      setError(err.message || "Failed to reset game. Starting a new session...");
      initGame();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset scores back to zero
  const handleResetScores = () => {
    setScores({ x: 0, o: 0, draws: 0 });
    handleReset();
  };

  const winningLine = status === "won" ? getWinningLine(board) : [];
  const isXNext = currentPlayer === "X";

  let statusText = "";
  let statusStyle = "";

  if (status === "won" && winner) {
    statusText = `Player ${winner} Wins!`;
    statusStyle = winner === "X"
      ? "bg-teal-500/20 text-teal-200 border-teal-400/60 shadow-teal-500/30 animate-bounce"
      : "bg-purple-500/20 text-purple-200 border-purple-400/60 shadow-purple-500/30 animate-bounce";
  } else if (status === "draw") {
    statusText = "It's a Draw!";
    statusStyle = "bg-amber-500/20 text-amber-200 border-amber-400/60 shadow-amber-500/30";
  } else {
    statusText = `Player ${currentPlayer}'s Turn`;
    statusStyle = isXNext
      ? "bg-teal-900/80 text-teal-200 border-teal-500/40"
      : "bg-purple-950/80 text-purple-200 border-purple-500/40";
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-950 via-teal-900 to-emerald-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 font-sans select-none relative overflow-hidden">
      {/* Subtle ambient backdrop glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Title */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-teal-200 via-emerald-100 to-teal-300 mb-1.5 drop-shadow-md text-center">
        Tic Tac Toe
      </h1>
      <p className="text-teal-200/70 text-xs sm:text-sm md:text-base mb-6 font-medium tracking-wider uppercase">
        Classic 3x3 Strategy Game
      </p>

      {/* Error Alert Banner */}
      {error && (
        <div className="w-full max-w-[460px] mb-4 p-4 rounded-2xl bg-red-900/80 border border-red-500/50 text-red-200 text-sm flex items-center justify-between gap-3 shadow-lg backdrop-blur-md">
          <span>⚠️ {error}</span>
          <button
            onClick={initGame}
            className="px-3 py-1 bg-red-800 hover:bg-red-700 text-white font-bold rounded-lg text-xs cursor-pointer transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Scoreboard Card */}
      <div className="flex items-center gap-4 sm:gap-6 bg-teal-900/70 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-teal-700/50 shadow-xl mb-6 text-sm sm:text-base font-semibold">
        <div className="flex flex-col items-center min-w-[70px]">
          <span className="text-teal-300 text-xs uppercase tracking-wider font-bold">Player X</span>
          <span className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">{scores.x}</span>
        </div>
        <div className="w-px h-8 bg-teal-700/60" />
        <div className="flex flex-col items-center min-w-[70px]">
          <span className="text-amber-300 text-xs uppercase tracking-wider font-bold">Draws</span>
          <span className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">{scores.draws}</span>
        </div>
        <div className="w-px h-8 bg-teal-700/60" />
        <div className="flex flex-col items-center min-w-[70px]">
          <span className="text-purple-300 text-xs uppercase tracking-wider font-bold">Player O</span>
          <span className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">{scores.o}</span>
        </div>
      </div>

      {/* Status Banner */}
      <div className="w-full max-w-[320px] xs:max-w-[360px] sm:max-w-[420px] md:max-w-[460px] mb-6">
        <div
          className={`py-3.5 px-6 rounded-2xl border backdrop-blur-md shadow-lg text-center text-xl sm:text-2xl font-extrabold tracking-wide transition-all duration-300 ${statusStyle}`}
        >
          {loading ? "Connecting to backend..." : statusText}
        </div>
      </div>

      {/* Game Board Container */}
      <div className="flex flex-col items-center justify-center w-full z-10">
        {loading ? (
          <div className="w-full max-w-[320px] xs:max-w-[360px] sm:max-w-[420px] md:max-w-[460px] aspect-square p-5 bg-teal-900/60 backdrop-blur-md rounded-3xl border border-teal-700/40 shadow-2xl flex flex-col items-center justify-center gap-3 text-teal-200">
            <div className="w-10 h-10 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
            <span className="font-semibold text-sm">Starting game session...</span>
          </div>
        ) : (
          <Board
            board={board}
            onCellClick={handleClick}
            winningLine={winningLine}
            isGameOver={status !== "playing" || isSubmitting}
            isXNext={isXNext}
          />
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mt-8 z-10">
        <button
          type="button"
          onClick={handleReset}
          disabled={loading || isSubmitting}
          className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 text-white font-bold text-base sm:text-lg rounded-2xl shadow-xl shadow-purple-950/50 hover:shadow-purple-700/40 transition-all duration-200 cursor-pointer border border-purple-400/30 focus:outline-none focus:ring-4 focus:ring-purple-500/40 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {isSubmitting ? "Resetting..." : "Reset Game"}
        </button>

        {(scores.x > 0 || scores.o > 0 || scores.draws > 0) && (
          <button
            type="button"
            onClick={handleResetScores}
            disabled={loading || isSubmitting}
            className="px-5 py-3.5 bg-teal-900/60 hover:bg-teal-800/80 active:scale-95 text-teal-200 hover:text-white font-semibold text-xs sm:text-sm rounded-2xl border border-teal-700/50 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-400/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset Scores
          </button>
        )}
      </div>
    </div>
  );
}
