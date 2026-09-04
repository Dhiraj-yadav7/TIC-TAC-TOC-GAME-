import { useState, useEffect, useCallback } from "react";
import Board from "./Board";
import Scoreboard from "./Scoreboard";
import GameHistory from "./GameHistory";
import PlayerSetup from "./PlayerSetup";
import { createGame, makeMove, resetGame, getGameStats, getGameHistory } from "../services/api";

// All 8 winning line combinations on a 3x3 grid for UI highlight
const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

// Helper to determine winning cell line for visual styling
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
  // Game session & backend source of truth state
  const [gameId, setGameId] = useState(null);
  const [playerX, setPlayerX] = useState("");
  const [playerO, setPlayerO] = useState("");
  const [board, setBoard] = useState(Array(9).fill(""));
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [winner, setWinner] = useState(null);
  const [status, setStatus] = useState("playing");

  const [isGameStarted, setIsGameStarted] = useState(false);

  // UI loading, submitting, and error states
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Statistics and History state
  const [stats, setStats] = useState({ xWins: 0, oWins: 0, draws: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Sync game document from MongoDB into React state
  const updateGameState = (game) => {
    setGameId(game._id);
    setPlayerX(game.playerX);
    setPlayerO(game.playerO);
    setBoard(game.board);
    setCurrentPlayer(game.currentPlayer);
    setWinner(game.winner);
    setStatus(game.status);
    setIsGameStarted(true);
  };

  // Fetch live scoreboard statistics from API
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const data = await getGameStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch game stats:", err.message);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch recent game history from API
  const fetchHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      const data = await getGameHistory(10);
      setHistory(data);
    } catch (err) {
      console.error("Failed to fetch game history:", err.message);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  // Fetch stats and history on mount
  useEffect(() => {
    fetchStats();
    fetchHistory();
  }, [fetchStats, fetchHistory]);

  // Start game with player names via POST /api/games
  const handleStartGame = async (nameX, nameO) => {
    try {
      setLoading(true);
      setError(null);
      const game = await createGame(nameX, nameO);
      updateGameState(game);
    } catch (err) {
      setError(err.message || "Failed to start game session. Please check your backend.");
    } finally {
      setLoading(false);
    }
  };

  // Handle cell click move -> PUT /api/games/:id/move
  const handleClick = async (index) => {
    if (!gameId || board[index] !== "" || status !== "playing" || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);
      const updatedGame = await makeMove(gameId, index, currentPlayer);
      updateGameState(updatedGame);

      // Refresh stats and history when game ends
      if (updatedGame.status === "won" || updatedGame.status === "draw") {
        fetchStats();
        fetchHistory();
      }
    } catch (err) {
      setError(err.message || "Failed to record move. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset game board on backend while preserving current players
  const handleReset = async () => {
    if (!gameId) return;

    try {
      setIsSubmitting(true);
      setError(null);
      const updatedGame = await resetGame(gameId);
      updateGameState(updatedGame);
    } catch (err) {
      setError(err.message || "Failed to reset game.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Change players / Return to Player Setup
  const handleChangePlayers = () => {
    setGameId(null);
    setIsGameStarted(false);
    setBoard(Array(9).fill(""));
    setStatus("playing");
    setWinner(null);
    setError(null);
  };

  const winningLine = status === "won" ? getWinningLine(board) : [];
  const isXNext = currentPlayer === "X";

  // Dynamic player name formatting
  const activePlayerName = isXNext ? playerX : playerO;
  const winnerPlayerName = winner === "X" ? playerX : winner === "O" ? playerO : "";

  let statusText = "";
  let statusStyle = "";

  if (status === "won" && winner) {
    statusText = `${winnerPlayerName} Wins!`;
    statusStyle = winner === "X"
      ? "bg-teal-500/20 text-teal-200 border-teal-400/60 shadow-teal-500/30 animate-bounce"
      : "bg-purple-500/20 text-purple-200 border-purple-400/60 shadow-purple-500/30 animate-bounce";
  } else if (status === "draw") {
    statusText = "It's a Draw!";
    statusStyle = "bg-amber-500/20 text-amber-200 border-amber-400/60 shadow-amber-500/30";
  } else {
    statusText = `${activePlayerName} (${currentPlayer})'s Turn`;
    statusStyle = isXNext
      ? "bg-teal-900/80 text-teal-200 border-teal-500/40"
      : "bg-purple-950/80 text-purple-200 border-purple-500/40";
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-950 via-teal-900 to-emerald-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 font-sans select-none relative overflow-x-hidden">
      {/* Ambient glow backdrop */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Title */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-teal-200 via-emerald-100 to-teal-300 mb-1.5 drop-shadow-md text-center">
        Tic Tac Toe
      </h1>
      <p className="text-teal-200/70 text-xs sm:text-sm md:text-base mb-6 font-medium tracking-wider uppercase">
        Full-Stack MERN Edition
      </p>

      {/* Error Alert Banner */}
      {error && (
        <div className="w-full max-w-[460px] mb-4 p-4 rounded-2xl bg-red-900/80 border border-red-500/50 text-red-200 text-sm flex items-center justify-between gap-3 shadow-lg backdrop-blur-md z-20">
          <span>⚠️ {error}</span>
          <button
            onClick={handleChangePlayers}
            type="button"
            className="px-3 py-1 bg-red-800 hover:bg-red-700 text-white font-bold rounded-lg text-xs cursor-pointer transition-colors"
          >
            Reset
          </button>
        </div>
      )}

      {/* Live API Scoreboard */}
      <Scoreboard stats={stats} loading={statsLoading} playerX={playerX || "Player X"} playerO={playerO || "Player O"} />

      {/* Conditional Rendering: Player Setup vs Game Board */}
      {!isGameStarted ? (
        <PlayerSetup onStartGame={handleStartGame} loading={loading} />
      ) : (
        <>
          {/* Status Banner */}
          <div className="w-full max-w-[320px] xs:max-w-[360px] sm:max-w-[420px] md:max-w-[460px] mb-6">
            <div
              className={`py-3.5 px-6 rounded-2xl border backdrop-blur-md shadow-lg text-center text-xl sm:text-2xl font-extrabold tracking-wide transition-all duration-300 ${statusStyle}`}
            >
              {statusText}
            </div>
          </div>

          {/* Game Board Container */}
          <div className="flex flex-col items-center justify-center w-full z-10">
            <Board
              board={board}
              onCellClick={handleClick}
              winningLine={winningLine}
              isGameOver={status !== "playing" || isSubmitting}
              isXNext={isXNext}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mt-8 z-10">
            <button
              type="button"
              onClick={handleReset}
              disabled={isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 text-white font-bold text-sm sm:text-base rounded-2xl shadow-xl shadow-purple-950/50 transition-all cursor-pointer border border-purple-400/30 flex items-center gap-2 disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {isSubmitting ? "Resetting..." : "Reset Board"}
            </button>

            <button
              type="button"
              onClick={handleChangePlayers}
              className="px-5 py-3 bg-teal-900/60 hover:bg-teal-800/80 active:scale-95 text-teal-200 hover:text-white font-semibold text-xs sm:text-sm rounded-2xl border border-teal-700/50 transition-all cursor-pointer"
            >
              ⚙️ Change Players
            </button>
          </div>
        </>
      )}

      {/* Game History Section */}
      <GameHistory history={history} loading={historyLoading} onRefresh={fetchHistory} />
    </div>
  );
}
