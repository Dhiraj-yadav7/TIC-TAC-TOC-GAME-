export default function Cell({ value, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full aspect-square bg-[#f5f5dc] hover:bg-[#fffdd0] text-slate-800 font-bold text-4xl sm:text-5xl md:text-6xl rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center border-none cursor-pointer focus:outline-none focus:ring-4 focus:ring-purple-400/50 active:scale-95"
      aria-label="Game cell"
    >
      {value}
    </button>
  );
}
