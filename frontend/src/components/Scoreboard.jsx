export default function Scoreboard({ stats, loading }) {
  const xWins = stats?.xWins ?? 0;
  const oWins = stats?.oWins ?? 0;
  const draws = stats?.draws ?? 0;

  return (
    <div
      aria-label="Game Scoreboard"
      className="flex items-center justify-around gap-2 sm:gap-6 bg-teal-900/70 backdrop-blur-md px-4 sm:px-6 py-3.5 rounded-2xl border border-teal-700/50 shadow-xl mb-6 w-full max-w-[320px] xs:max-w-[360px] sm:max-w-[420px] md:max-w-[460px] text-sm sm:text-base font-semibold"
    >
      <div className="flex flex-col items-center min-w-[65px] sm:min-w-[80px]">
        <span className="text-teal-300 text-[10px] sm:text-xs uppercase tracking-wider font-bold">
          Player X Wins
        </span>
        <span className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
          {loading ? '...' : xWins}
        </span>
      </div>

      <div className="w-px h-8 bg-teal-700/60" />

      <div className="flex flex-col items-center min-w-[65px] sm:min-w-[80px]">
        <span className="text-amber-300 text-[10px] sm:text-xs uppercase tracking-wider font-bold">
          Draws
        </span>
        <span className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
          {loading ? '...' : draws}
        </span>
      </div>

      <div className="w-px h-8 bg-teal-700/60" />

      <div className="flex flex-col items-center min-w-[65px] sm:min-w-[80px]">
        <span className="text-purple-300 text-[10px] sm:text-xs uppercase tracking-wider font-bold">
          Player O Wins
        </span>
        <span className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
          {loading ? '...' : oWins}
        </span>
      </div>
    </div>
  );
}
