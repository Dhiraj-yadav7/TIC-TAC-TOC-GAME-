import Board from "./Board";

export default function TicTacToe() {
  return (
    <div className="min-h-screen bg-[#548687] text-white flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      {/* Header */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-wide text-amber-100 mb-8 sm:mb-10 drop-shadow-lg text-center">
        Tic Tac Toe
      </h1>

      {/* Game Board Container */}
      <div className="flex flex-col items-center justify-center w-full">
        <Board />
      </div>

      {/* Reset Button */}
      <button
        type="button"
        className="mt-8 sm:mt-10 px-6 sm:px-8 py-3 sm:py-4 bg-[#8a2be2] hover:bg-[#7b24cc] active:bg-[#6c1fb8] text-[#ffe4c4] font-bold text-xl sm:text-2xl rounded-2xl shadow-xl hover:shadow-purple-900/40 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer border-none focus:outline-none focus:ring-4 focus:ring-purple-300"
      >
        Reset Game
      </button>
    </div>
  );
}
