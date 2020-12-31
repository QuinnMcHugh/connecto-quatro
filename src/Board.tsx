import { observer } from 'mobx-react-lite';

import { CellType } from './GridModel';
import { GameModel } from './GameModel';

const Cell = (props: { cell: CellType }) => {
  const colorClass = props.cell === CellType.Empty
    ? 'blank'
    : props.cell === CellType.Red
      ? 'red-disc'
      : 'yellow-disc'; // ToDo: how to define these class references in TS?
  return <div className={`cell ${colorClass}`}></div>;
}

interface IRowProps {
  cells: Array<CellType>;
}

const Row = observer((props: IRowProps) => {
  return (
    <div>
      {props.cells.map((cell: CellType) => <Cell key={Math.random()} cell={cell} />)}
    </div>
  );
})

interface IBoardProps {
  game: GameModel;
}

const Board = observer((props: IBoardProps) => {
  return (
    <div className="board">
      {props.game.rows.map((row: Array<CellType>) => <Row key={Math.random()} cells={row} />)}
    </div>
  );
});

export { Board };