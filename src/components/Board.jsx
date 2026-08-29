import Cell from "./Cell";

export default function Board() {
  // 9 initial empty slots for the 3x3 grid
  const cells = Array(9).fill(null);

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-[320px] sm:max-w-[400px] md:max-w-[440px] aspect-square p-2 sm:p-4 bg-teal-800/20 backdrop-blur-sm rounded-3xl shadow-inner">
      {cells.map((value, index) => (
        <Cell key={index} value={value} />
      ))}
    </div>
  );
}
