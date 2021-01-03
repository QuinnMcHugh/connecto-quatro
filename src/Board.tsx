import { observer } from 'mobx-react-lite';

import { CellType } from './GridModel';
import { GameModel } from './GameModel';

interface ICellProps {
  column: number;
  row: number;

  // ToDo: group common CellProps into one object to be passed through component hierarchy
  onClick: (column: number) => void;
  onHover: (column: number) => void;
  styleCell: (column: number, row: number) => string;
}

const Cell = (props: ICellProps) => {
  return (
    <div
      className={props.styleCell(props.column, props.row)}
      onMouseOver={() => props.onHover(props.column)}
      onClick={() => props.onClick(props.column)}
    ></div>
  );
}

interface IRowProps {
  cells: Array<CellType>;
  index: number;
  onCellHover: (column: number) => void;
  onCellClick: (column: number) => void;
  styleCell: (column: number, row: number) => string;
}

const Row = observer((props: IRowProps) => {
  return (
    <div>
      {props.cells.map((cell, index) => (
        <Cell
          key={Math.random()}
          column={index}
          row={props.index}
          onHover={props.onCellHover}
          onClick={props.onCellClick}
          styleCell={props.styleCell}
        />)
      )}
    </div>
  );
})

interface IBoardProps {
  game: GameModel;
  onCellHover: (column: number) => void;
  onCellClick: (column: number) => void;
  styleCell: (column: number, row: number) => string;
}

export const Board = observer((props: IBoardProps) => {
  return (
    <div className="board">
      {props.game.rows.map((row, rowIndex) => (
        <Row
          key={Math.random()}
          cells={row}
          index={rowIndex}
          onCellHover={props.onCellHover}
          onCellClick={props.onCellClick}
          styleCell={props.styleCell}
        />)
      )}
    </div>
  );
});