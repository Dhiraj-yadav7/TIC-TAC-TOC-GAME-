import Cell from "./Cell";

export default function Board({ board, onCellClick, winningLine = [], isGameOver }) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-[320px] sm:max-w-[400px] md:max-w-[440px] aspect-square p-2 sm:p-4 bg-teal-800/20 backdrop-blur-sm rounded-3xl shadow-inner">
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

