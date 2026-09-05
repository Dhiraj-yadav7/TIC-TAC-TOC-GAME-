import { useState, useEffect, useCallback } from 'react';
import { getLeaderboard } from '../services/api';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getLeaderboard();
      setLeaderboard(data || []);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err.message);
      setError(err.message || 'Failed to load global leaderboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <span className="px-2.5 py-1 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/50 font-black text-xs flex items-center gap-1 shadow-amber-400/10 shadow-lg">
          🥇 1st
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="px-2.5 py-1 rounded-xl bg-slate-300/20 text-slate-200 border border-slate-300/50 font-black text-xs flex items-center gap-1">
          🥈 2nd
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="px-2.5 py-1 rounded-xl bg-amber-700/20 text-amber-400 border border-amber-600/50 font-black text-xs flex items-center gap-1">
          🥉 3rd
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-xl bg-teal-950/60 text-teal-300/70 font-bold text-xs">
        #{rank}
      </span>
    );
  };

  return (
    <div className="w-full max-w-3xl bg-teal-900/60 backdrop-blur-md rounded-3xl border border-teal-700/40 shadow-2xl p-4 sm:p-6 md:p-8 text-slate-100 transition-all my-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-teal-200 tracking-tight flex items-center gap-2">
            🏆 Global Leaderboard
          </h2>
          <p className="text-xs sm:text-sm text-teal-300/70 mt-1">
            Top registered players ranked by Wins, Win Rate %, & Games
          </p>
        </div>

        <button
          onClick={fetchLeaderboard}
          disabled={loading}
          type="button"
          className="text-xs text-teal-300 hover:text-teal-100 disabled:opacity-50 flex items-center gap-1.5 font-semibold transition-all cursor-pointer bg-teal-950/40 hover:bg-teal-950/80 border border-teal-700/50 px-3 py-1.5 rounded-xl shadow-sm"
          title="Refresh rankings"
        >
          <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Loading Skeleton vs Error vs Empty vs Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-teal-800/40 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="py-8 text-center text-red-300 text-xs sm:text-sm font-medium bg-red-950/30 border border-red-800/40 rounded-2xl p-6">
          <p className="mb-3 font-semibold">⚠️ {error}</p>
          <button
            onClick={fetchLeaderboard}
            type="button"
            className="px-4 py-1.5 bg-red-900/60 hover:bg-red-800 text-red-100 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-md"
          >
            Retry Loading Leaderboard
          </button>
        </div>
      ) : !leaderboard || leaderboard.length === 0 ? (
        <div className="py-12 text-center text-teal-200/60 text-xs sm:text-sm font-medium bg-teal-950/40 rounded-2xl border border-teal-800/40">
          No registered players on the leaderboard yet. Be the first to register and play!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-[11px] sm:text-xs text-teal-300/70 font-bold uppercase tracking-wider px-3">
                <th className="pb-2 pl-4">Rank</th>
                <th className="pb-2">Player</th>
                <th className="pb-2 text-center">Wins</th>
                <th className="pb-2 text-center">Win Rate</th>
                <th className="pb-2 text-center hidden sm:table-cell">L / D</th>
                <th className="pb-2 text-right pr-4">Total</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((player) => {
                const isTop1 = player.rank === 1;
                const isTop2 = player.rank === 2;
                const isTop3 = player.rank === 3;

                const rowBg = isTop1
                  ? 'bg-gradient-to-r from-amber-950/70 via-teal-950/90 to-amber-950/50 border-amber-500/50 shadow-amber-500/10 shadow-lg'
                  : isTop2
                  ? 'bg-gradient-to-r from-slate-900/80 via-teal-950/90 to-slate-900/60 border-slate-400/40'
                  : isTop3
                  ? 'bg-gradient-to-r from-amber-950/40 via-teal-950/90 to-amber-950/30 border-amber-700/40'
                  : 'bg-teal-950/60 border-teal-800/50 hover:border-teal-600/60';

                return (
                  <tr
                    key={player._id}
                    className={`rounded-2xl border transition-all text-xs sm:text-sm ${rowBg}`}
                  >
                    {/* Rank */}
                    <td className="py-3.5 pl-4 rounded-l-2xl font-extrabold">
                      {getRankBadge(player.rank)}
                    </td>

                    {/* Player Name */}
                    <td className="py-3.5 font-bold text-teal-100">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                            isTop1
                              ? 'bg-amber-400 text-amber-950'
                              : isTop2
                              ? 'bg-slate-300 text-slate-950'
                              : isTop3
                              ? 'bg-amber-700 text-amber-100'
                              : 'bg-teal-800 text-teal-200'
                          }`}
                        >
                          {player.name ? player.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <span className="truncate max-w-[140px] sm:max-w-[200px]">
                          {player.name}
                        </span>
                      </div>
                    </td>

                    {/* Wins */}
                    <td className="py-3.5 text-center font-black text-emerald-300">
                      {player.wins}
                    </td>

                    {/* Win Rate */}
                    <td className="py-3.5 text-center font-extrabold text-purple-300">
                      {player.winPercentage}%
                    </td>

                    {/* Losses / Draws */}
                    <td className="py-3.5 text-center text-teal-300/70 hidden sm:table-cell">
                      <span className="text-red-400/90 font-medium">{player.losses}L</span> /{' '}
                      <span className="text-amber-400/90 font-medium">{player.draws}D</span>
                    </td>

                    {/* Total Games */}
                    <td className="py-3.5 pr-4 text-right rounded-r-2xl font-bold text-teal-200">
                      {player.totalGames}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
