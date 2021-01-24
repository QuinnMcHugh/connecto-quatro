import { observer } from 'mobx-react-lite';

import { CellType } from './GridModel';
import { GameModel, MatchType } from './GameModel';

interface ICellProps {
  column: number;
  row: number;

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

const getBoardOverlay = (waitingOnOpponent: boolean, gameDisconnected: boolean): string => {
  if (waitingOnOpponent) {
    return 'Waiting on opponent to join...'; // todo: make this a react component, where every second another dot gets added for 'live' feel
  } else if (gameDisconnected) {
    return 'Opponent has disconnected';
  } else {
    return '';
  }
};

interface IBoardProps {
  game: GameModel;
  onCellHover: (column: number) => void;
  onCellClick: (column: number) => void;
  styleCell: (column: number, row: number) => string;
}

export const Board = observer((props: IBoardProps) => {
  const inRemoteGame = props.game.matchType === MatchType.Remote1v1;
  const waitingOnOpponent = inRemoteGame && !props.game.hasOpponentJoined;
  const gameDisconnected = inRemoteGame && props.game.hasOpponentLeft;
  const gameDisabled = waitingOnOpponent || gameDisconnected;
  const overlayMessage = getBoardOverlay(waitingOnOpponent, gameDisconnected);

  const handleCellHover = gameDisabled
    ? (column: number) => {}
    : props.onCellHover;
  const handleCellClick = gameDisabled
    ? (column: number) => {}
    : props.onCellClick;
  const disabledClass = gameDisabled
    ? 'board-disabled'
    : '';
    
  return (
    <>
      <div className={`board ${disabledClass}`}>
        {props.game.rows.map((row, rowIndex) => (
          <Row
            key={Math.random()}
            cells={row}
            index={rowIndex}
            onCellHover={handleCellHover}
            onCellClick={handleCellClick}
            styleCell={props.styleCell}
          />)
        )}
      </div>
      {overlayMessage && 
        <div className="board-overlay">
          <h2>{overlayMessage}</h2>
        </div>
      }
    </>
  );
});