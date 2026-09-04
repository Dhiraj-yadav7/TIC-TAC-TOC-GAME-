export default function GameHistory({ history, loading, onRefresh }) {
  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-full max-w-[320px] xs:max-w-[360px] sm:max-w-[420px] md:max-w-[460px] mt-8 bg-teal-900/60 backdrop-blur-md rounded-3xl border border-teal-700/40 shadow-2xl p-4 sm:p-6 text-slate-100">
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
            className="text-xs text-teal-300 hover:text-teal-100 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
            title="Refresh history"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-teal-800/40 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : !history || history.length === 0 ? (
        <div className="py-6 text-center text-teal-200/60 text-xs sm:text-sm font-medium">
          No completed games yet. Finish a match to record history!
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
          {history.map((game) => {
            const isDraw = game.status === 'draw' || !game.winner;
            const winnerLabel = isDraw
              ? 'Draw'
              : game.winner === 'X'
              ? `${game.playerX || 'Player X'} (X)`
              : `${game.playerO || 'Player O'} (O)`;

            return (
              <div
                key={game._id}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-teal-950/60 border border-teal-800/50 hover:border-teal-600/60 transition-all text-xs sm:text-sm"
              >
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2 font-semibold">
                    <span className="text-teal-300">{game.playerX || 'Player X'}</span>
                    <span className="text-teal-600 text-xs">vs</span>
                    <span className="text-purple-300">{game.playerO || 'Player O'}</span>
                  </div>
                  <span className="text-[10px] text-teal-300/50">
                    {formatDate(game.createdAt)}
                  </span>
                </div>

                <div className="flex items-center">
                  {isDraw ? (
                    <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold">
                      Draw
                    </span>
                  ) : (
                    <span
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border ${
                        game.winner === 'X'
                          ? 'bg-teal-500/20 text-teal-200 border-teal-500/40'
                          : 'bg-purple-500/20 text-purple-200 border-purple-500/40'
                      }`}
                    >
                      {winnerLabel}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
