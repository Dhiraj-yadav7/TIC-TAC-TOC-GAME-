import Cell from "./Cell";

export default function Board({ board, onCellClick, winningLine = [], isGameOver, isXNext }) {
  return (
    <div
      role="grid"
      aria-label="Tic Tac Toe Game Board"
      className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-5 w-full max-w-[320px] xs:max-w-[360px] sm:max-w-[420px] md:max-w-[460px] aspect-square p-3.5 sm:p-4 md:p-5 bg-teal-900/60 backdrop-blur-md rounded-3xl border border-teal-700/40 shadow-2xl shadow-teal-950/80"
    >
      {board.map((value, index) => (
        <Cell
          key={index}
          index={index}
          value={value}
          onClick={() => onCellClick(index)}
          isWinningCell={winningLine.includes(index)}
          isDisabled={Boolean(value) || isGameOver}
          isGameOver={isGameOver}
          isXNext={isXNext}
        />
      ))}
    </div>
  );
}
