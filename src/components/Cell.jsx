export default function Cell({ value, onClick, isWinningCell, isDisabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={`w-full aspect-square bg-[#f5f5dc] text-slate-800 font-bold text-4xl sm:text-5xl md:text-6xl rounded-2xl shadow-md transition-all duration-200 flex items-center justify-center border-none focus:outline-none focus:ring-4 focus:ring-purple-400/50 active:scale-95 ${
        isDisabled
          ? "cursor-not-allowed"
          : "hover:bg-[#fffdd0] hover:shadow-lg cursor-pointer"
      } ${
        isWinningCell
          ? "bg-amber-300 ring-4 ring-amber-500 scale-105"
          : ""
      }`}
      aria-label="Game cell"
    >
      <span className={value === "X" ? "text-teal-700" : "text-purple-700"}>
        {value}
      </span>
    </button>
  );
}

