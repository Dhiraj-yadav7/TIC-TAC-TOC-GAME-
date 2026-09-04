import { useState } from "react";

export default function PlayerSetup({ onStartGame, loading }) {
  const [playerX, setPlayerX] = useState("");
  const [playerO, setPlayerO] = useState("");
  const [validationError, setValidationError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!playerX.trim() || !playerO.trim()) {
      setValidationError("Both Player X and Player O names are required.");
      return;
    }
    setValidationError("");
    onStartGame(playerX.trim(), playerO.trim());
  };

  return (
    <div className="w-full max-w-[320px] xs:max-w-[360px] sm:max-w-[420px] md:max-w-[460px] bg-teal-900/60 backdrop-blur-md rounded-3xl border border-teal-700/40 shadow-2xl p-5 sm:p-6 mb-6 text-slate-100 z-10">
      <h2 className="text-xl sm:text-2xl font-extrabold text-teal-200 text-center mb-1 drop-shadow-sm">
        Player Setup
      </h2>
      <p className="text-teal-200/70 text-xs sm:text-sm text-center mb-5 font-medium">
        Enter player names to unlock the game board
      </p>

      {validationError && (
        <div className="mb-4 p-3 rounded-2xl bg-red-900/80 border border-red-500/50 text-red-200 text-xs sm:text-sm text-center font-medium shadow-md">
          ⚠️ {validationError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="playerX" className="block text-xs font-bold uppercase tracking-wider text-teal-300 mb-1.5">
            Player X Name <span className="text-red-400">*</span>
          </label>
          <input
            id="playerX"
            type="text"
            value={playerX}
            onChange={(e) => setPlayerX(e.target.value)}
            placeholder="e.g. Dhiraj"
            required
            maxLength={25}
            className="w-full px-4 py-3 rounded-2xl bg-teal-950/70 border border-teal-700/60 text-white placeholder-teal-600/70 focus:outline-none focus:ring-2 focus:ring-teal-400/60 focus:border-teal-400 text-sm font-semibold transition-all"
          />
        </div>

        <div>
          <label htmlFor="playerO" className="block text-xs font-bold uppercase tracking-wider text-purple-300 mb-1.5">
            Player O Name <span className="text-red-400">*</span>
          </label>
          <input
            id="playerO"
            type="text"
            value={playerO}
            onChange={(e) => setPlayerO(e.target.value)}
            placeholder="e.g. Rahul"
            required
            maxLength={25}
            className="w-full px-4 py-3 rounded-2xl bg-teal-950/70 border border-purple-700/60 text-white placeholder-purple-600/70 focus:outline-none focus:ring-2 focus:ring-purple-400/60 focus:border-purple-400 text-sm font-semibold transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3.5 px-6 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 hover:from-teal-400 hover:to-emerald-400 active:scale-95 text-teal-950 font-extrabold text-base rounded-2xl shadow-xl shadow-teal-950/60 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? "Starting Game..." : "🎮 Start Game"}
        </button>
      </form>
    </div>
  );
}
