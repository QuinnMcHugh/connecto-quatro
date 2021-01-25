import { observer } from 'mobx-react-lite';
import React from 'react';

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
    <div className="row">
      {props.cells.map((cell, index) => (
        <Cell
          key={index}
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

interface IMessageOverlayProps {
  waitingOnOpponent: boolean;
  gameDisconnected: boolean;
}

const MessageOverlay = (props: IMessageOverlayProps): JSX.Element => {
  const [dots, setDots] = React.useState<number>(0);
  
  React.useEffect(() => {
    if (props.waitingOnOpponent) {
      let timer = setTimeout(() => {
        const nextDots = (dots + 1) % 4;
        setDots(nextDots);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [props.waitingOnOpponent, dots]);

  if (props.waitingOnOpponent) {
    return <h3>Waiting on opponent to join {Array(dots).fill('.').join(' ')}</h3>;
  } else if (props.gameDisconnected) {
    return <h3>Opponent has disconnected</h3>;
  } else {
    return null;
  }
};

interface IBoardProps {
  game: GameModel;
  onCellHover: (column: number) => void;
  onCellClick: (column: number) => void;
  styleCell: (column: number, row: number) => string;
}

export const Board = observer((props: IBoardProps) => {
  const waitingOnOpponent = props.game.matchType === MatchType.Remote1v1 && !props.game.hasOpponentJoined;
  const gameDisconnected = props.game.matchType === MatchType.Remote1v1 && props.game.hasOpponentLeft;
  const gameDisabled = waitingOnOpponent || gameDisconnected;

  const overlayMessage = MessageOverlay({
    waitingOnOpponent,
    gameDisconnected,
  });
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
            key={rowIndex}
            cells={row}
            index={rowIndex}
            onCellHover={handleCellHover}
            onCellClick={handleCellClick}
            styleCell={props.styleCell}
          />)
        )}
        {overlayMessage && 
          <div className="board-overlay">
            {overlayMessage}
          </div>
        }
      </div>
    </>
  );
});