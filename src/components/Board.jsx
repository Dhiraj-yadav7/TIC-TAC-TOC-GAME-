import Cell from "./Cell";

export default function Board({ board, onCellClick, winningLine = [], isGameOver }) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-[340px] sm:max-w-[420px] md:max-w-[460px] aspect-square p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-700/60 shadow-2xl">
      {board.map((value, index) => (
        <Cell
          key={index}
          value={value}
          onClick={() => onCellClick(index)}
          isWinningCell={winningLine.includes(index)}
          isDisabled={Boolean(value) || isGameOver}
        />
      ))}
    </div>
  );
}


