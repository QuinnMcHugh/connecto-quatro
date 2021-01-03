import { NUM_COLS } from './GridModel';
import { Turn } from './GameModel';

interface IDiscDropperProps {
// todo: may want to includes these two if clicking on the space above columns should be permitted (nice feature)
//   handleColumnClick: (column: number) => void;
//   isColumnDisabled: (column: number) => boolean;

  hoveredColumn: number;
  turn: Turn;
}

export const DiscDropper = (props: IDiscDropperProps) => {
  const columns: Array<boolean> = Array(NUM_COLS).fill(false);
  if (0 <= props.hoveredColumn && props.hoveredColumn < NUM_COLS) {
    columns[props.hoveredColumn] = true;
  }

  const hoverCells = columns.map(hovered => {
    const colorClass = props.turn === Turn.GameOver
      ? 'blank'
      : props.turn === Turn.Red
        ? 'red-disc'
        : 'yellow-disc';
    const visibilityClass = hovered ? '' : 'invisible';
    const cellClass = `cell ${colorClass} ${visibilityClass}`;
    return (
      <div key={Math.random()} className={cellClass}></div>
    );
  });

  return (
    <div className='column-hover'>
      {hoverCells}
    </div>
  );
};