export default function Cell({ value, onClick, isWinningCell, isDisabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={`w-full aspect-square bg-slate-800/90 hover:bg-slate-700/90 text-slate-100 font-extrabold text-4xl sm:text-5xl md:text-6xl rounded-2xl shadow-lg border border-slate-700/80 transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-teal-500/40 active:scale-95 ${
        isDisabled
          ? "cursor-not-allowed opacity-90"
          : "cursor-pointer hover:shadow-xl hover:border-slate-500/80"
      } ${
        isWinningCell
          ? "bg-amber-400/20 border-2 border-amber-400 ring-4 ring-amber-400/50 scale-105 shadow-amber-500/30 animate-pulse"
          : ""
      }`}
      aria-label={value ? `Cell with ${value}` : "Empty cell"}
    >
      {value && (
        <span
          className={`transition-all duration-300 transform scale-100 ${
            value === "X"
              ? "text-teal-400 drop-shadow-[0_0_12px_rgba(45,212,191,0.6)]"
              : "text-purple-400 drop-shadow-[0_0_12px_rgba(192,132,252,0.6)]"
          }`}
        >
          {value}
        </span>
      )}
    </button>
  );
}


