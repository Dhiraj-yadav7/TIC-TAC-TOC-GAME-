export default function GameHistory({ historyData, loading, error, onRefresh, onPageChange }) {
  const { games = [], currentPage = 1, totalPages = 1, totalGames = 0 } = historyData || {};

  const formatDateTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getResultText = (game) => {
    if (game.status === 'draw') {
      return 'Draw';
    }
    if (game.winnerSymbol === 'X' || game.winner === 'X') {
      return `${game.playerX || 'Player X'} (X) Wins`;
    }
    if (game.winnerSymbol === 'O' || game.winner === 'O') {
      return `${game.playerO || 'Player O'} (O) Wins`;
    }
    if (game.winnerName) {
      return `${game.winnerName} (${game.winnerSymbol || ''}) Wins`;
    }
    return 'Draw';
  };

  return (
    <div className="w-full max-w-[320px] xs:max-w-[360px] sm:max-w-[420px] md:max-w-[460px] mt-8 bg-teal-900/60 backdrop-blur-md rounded-3xl border border-teal-700/40 shadow-2xl p-4 sm:p-6 text-slate-100 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-teal-200 flex items-center gap-2">
          <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Game History
        </h2>
        {onRefresh && (
          <button
            onClick={onRefresh}
            type="button"
            disabled={loading}
            className="text-xs text-teal-300 hover:text-teal-100 disabled:opacity-50 flex items-center gap-1.5 font-semibold transition-all cursor-pointer bg-teal-950/40 hover:bg-teal-950/70 border border-teal-700/50 px-2.5 py-1 rounded-xl"
            title="Refresh history"
          >
            <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        )}
      </div>

      {/* Body: Loading / Error / Empty / List */}
      {loading ? (
        <div className="space-y-3 py-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-teal-800/40 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="py-6 text-center text-red-300 text-xs sm:text-sm font-medium bg-red-950/30 border border-red-800/40 rounded-2xl p-4">
          <p className="mb-2">⚠️ {error}</p>
          {onRefresh && (
            <button
              onClick={onRefresh}
              type="button"
              className="px-3 py-1 bg-red-900/60 hover:bg-red-800 text-red-100 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            >
              Retry Loading
            </button>
          )}
        </div>
      ) : !games || games.length === 0 ? (
        <div className="py-8 text-center text-teal-200/60 text-xs sm:text-sm font-medium bg-teal-950/40 rounded-2xl border border-teal-800/40">
          No games played yet
        </div>
      ) : (
        <div className="space-y-3">
          {games.map((game) => {
            const isDraw = game.status === 'draw';
            const isXWinner = !isDraw && (game.winnerSymbol === 'X' || game.winner === 'X');
            const resultText = getResultText(game);

            return (
              <div
                key={game._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-2xl bg-teal-950/70 border border-teal-800/50 hover:border-teal-600/60 shadow-md transition-all text-xs sm:text-sm"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 font-bold">
                    <span className="text-teal-200">{game.playerX || 'Player X'}</span>
                    <span className="text-teal-500 text-xs font-normal">vs</span>
                    <span className="text-purple-300">{game.playerO || 'Player O'}</span>
                  </div>
                  <span className="text-[11px] text-teal-300/60">
                    {formatDateTime(game.createdAt)}
                  </span>
                </div>

                <div className="flex items-center self-start sm:self-center">
                  <span
                    className={`px-3 py-1 rounded-xl text-[11px] font-extrabold border ${
                      isDraw
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-amber-500/10'
                        : isXWinner
                        ? 'bg-teal-500/20 text-teal-200 border-teal-500/40 shadow-teal-500/10'
                        : 'bg-purple-500/20 text-purple-200 border-purple-500/40 shadow-purple-500/10'
                    }`}
                  >
                    {resultText}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && !error && games && games.length > 0 && (
        <div className="flex items-center justify-between mt-5 pt-3 border-t border-teal-800/40 text-xs text-teal-200/80">
          <button
            onClick={() => onPageChange && onPageChange(currentPage - 1)}
            disabled={currentPage <= 1 || loading}
            type="button"
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold transition-all cursor-pointer border border-purple-400/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-purple-600 disabled:hover:to-indigo-600"
          >
            ← Previous
          </button>

          <span className="font-semibold text-teal-300 text-[11px] sm:text-xs">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => onPageChange && onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || totalGames === 0 || loading}
            type="button"
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold transition-all cursor-pointer border border-purple-400/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-purple-600 disabled:hover:to-indigo-600"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
