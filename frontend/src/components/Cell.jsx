export default function Cell({ value, onClick, isWinningCell, isDisabled, isGameOver, isXNext }) {
  let cellStyle = "bg-[#FAF7F2] border-[#E6DFD3] shadow-sm";

  if (isWinningCell) {
    cellStyle =
      "bg-amber-100 border-2 border-amber-500 ring-4 ring-amber-400/40 shadow-xl shadow-amber-500/20 scale-[1.03] z-10 animate-pulse";
  } else if (isGameOver) {
    cellStyle =
      "bg-[#E8E2D8] border-[#D6CEC0] opacity-50 shadow-none cursor-not-allowed scale-[0.98]";
  } else if (isDisabled) {
    cellStyle =
      "bg-[#FAF7F2] border-[#E6DFD3] cursor-not-allowed opacity-90";
  } else {
    cellStyle =
      "bg-[#FAF7F2] border-[#E6DFD3] hover:bg-[#FFFFFF] hover:border-teal-500/60 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 cursor-pointer group";
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={`w-full aspect-square rounded-2xl border transition-all duration-300 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-teal-500/30 ${cellStyle}`}
      aria-label={value ? `Cell with ${value}` : "Empty cell"}
    >
      {value === "X" && (
        <svg
          className="w-3/5 h-3/5 text-teal-600 drop-shadow-[0_2px_8px_rgba(13,148,136,0.3)] transition-all duration-300 transform scale-100"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      )}

      {value === "O" && (
        <svg
          className="w-3/5 h-3/5 text-purple-600 drop-shadow-[0_2px_8px_rgba(147,51,234,0.3)] transition-all duration-300 transform scale-100"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="8" />
        </svg>
      )}

      {!value && !isDisabled && !isGameOver && (
        <span className="opacity-0 group-hover:opacity-20 transition-opacity duration-200 flex items-center justify-center w-full h-full">
          {isXNext ? (
            <svg
              className="w-3/5 h-3/5 text-teal-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg
              className="w-3/5 h-3/5 text-purple-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="8" />
            </svg>
          )}
        </span>
      )}
    </button>
  );
}



