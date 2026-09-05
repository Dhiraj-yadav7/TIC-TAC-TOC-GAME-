import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserStats } from '../services/authApi';

export default function Profile({ onStartGame }) {
  const { user, token, logout } = useAuth();

  const [stats, setStats] = useState({
    totalGames: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    winPercentage: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getUserStats(token);
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch user personal statistics:', err.message);
      setError(err.message || 'Failed to load personal statistics.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="w-full max-w-xl bg-teal-900/60 backdrop-blur-md rounded-3xl border border-teal-700/40 shadow-2xl p-6 sm:p-8 text-slate-100 transition-all">
      {/* Header Profile Info */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 pb-6 border-b border-teal-800/50">
        <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-gradient-to-tr from-teal-400 via-emerald-400 to-purple-500 p-1 shadow-xl flex-shrink-0">
          <div className="w-full h-full rounded-full bg-teal-950 flex items-center justify-center text-3xl font-black text-teal-200">
            {user?.name ? user.name.charAt(0).toUpperCase() : '👤'}
          </div>
        </div>

        <div className="flex flex-col text-center sm:text-left flex-1 min-w-0">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-teal-100 truncate">
            {user?.name || 'Player Profile'}
          </h2>
          <p className="text-sm text-teal-300/70 truncate">{user?.email}</p>
          <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold">
              Authenticated
            </span>
            <span className="text-xs text-teal-300/50">
              Joined {formatDate(user?.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Section Title */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-teal-200 flex items-center gap-2">
          <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Personal Statistics
        </h3>

        <button
          onClick={fetchStats}
          disabled={loading}
          type="button"
          className="text-xs text-teal-300 hover:text-teal-100 disabled:opacity-50 flex items-center gap-1 font-semibold cursor-pointer bg-teal-950/40 px-2.5 py-1 rounded-xl border border-teal-700/50 transition-all"
        >
          <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Loading Skeletons vs Error vs Statistic Cards */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 bg-teal-800/40 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="py-6 text-center text-red-300 text-xs sm:text-sm font-medium bg-red-950/30 border border-red-800/40 rounded-2xl p-4">
          <p className="mb-2">⚠️ {error}</p>
          <button
            onClick={fetchStats}
            type="button"
            className="px-3 py-1 bg-red-900/60 hover:bg-red-800 text-red-100 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
          >
            Retry Loading Stats
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Card 1: Total Games */}
          <div className="bg-teal-950/70 border border-teal-800/60 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-md hover:border-teal-500/50 transition-all">
            <span className="text-2xl mb-1">🎮</span>
            <span className="text-2xl font-black text-teal-100">{stats.totalGames}</span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400/80 mt-0.5">
              Total Games
            </span>
          </div>

          {/* Card 2: Wins */}
          <div className="bg-teal-950/70 border border-teal-800/60 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-md hover:border-emerald-500/50 transition-all">
            <span className="text-2xl mb-1">🏆</span>
            <span className="text-2xl font-black text-emerald-300">{stats.wins}</span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400/80 mt-0.5">
              Wins
            </span>
          </div>

          {/* Card 3: Losses */}
          <div className="bg-teal-950/70 border border-teal-800/60 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-md hover:border-red-500/50 transition-all">
            <span className="text-2xl mb-1">❌</span>
            <span className="text-2xl font-black text-red-300">{stats.losses}</span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-400/80 mt-0.5">
              Losses
            </span>
          </div>

          {/* Card 4: Draws */}
          <div className="bg-teal-950/70 border border-teal-800/60 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-md hover:border-amber-500/50 transition-all">
            <span className="text-2xl mb-1">🤝</span>
            <span className="text-2xl font-black text-amber-300">{stats.draws}</span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/80 mt-0.5">
              Draws
            </span>
          </div>

          {/* Card 5: Win Percentage */}
          <div className="col-span-2 sm:col-span-2 bg-gradient-to-br from-purple-950/80 to-indigo-950/80 border border-purple-700/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg hover:border-purple-400/60 transition-all">
            <span className="text-2xl mb-1">📈</span>
            <span className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-teal-200 to-purple-200">
              {stats.winPercentage}%
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300/80 mt-0.5">
              Win Rate
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-teal-800/50">
        <button
          onClick={onStartGame}
          type="button"
          className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 active:scale-[0.98] text-teal-950 font-extrabold text-sm sm:text-base rounded-2xl shadow-lg transition-all cursor-pointer text-center"
        >
          🎮 Play Game Now
        </button>

        <button
          onClick={logout}
          type="button"
          className="py-3 px-6 bg-red-900/40 hover:bg-red-800/80 active:scale-[0.98] text-red-200 hover:text-white font-bold text-xs sm:text-sm rounded-2xl border border-red-700/40 transition-all cursor-pointer text-center"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
