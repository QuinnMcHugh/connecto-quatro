import React from 'react';
import { observer } from 'mobx-react-lite';

import { GameModel, Turn, convertTurnToCellType, MatchType } from './GameModel';
import { Board } from './Board';
import { NUM_COLS } from './GridModel';

interface ITurnDisplayProps {
  turn: Turn;
}

const TurnDisplay = (props: ITurnDisplayProps) => {
  const message = props.turn === Turn.GameOver
    ? 'Game Over'
    : props.turn === Turn.Red
      ? 'Red\'s Turn'
      : 'Yellow\'s Turn';
  return <span>{message}</span>;
};

interface IDiscDropperProps {
  handleColumnClick: (column: number) => void;
  isColumnDisabled: (column: number) => boolean;
}
const DiscDropper = (props: IDiscDropperProps) => {
  const columnButtons: JSX.Element[] = [];
  for (let i = 0; i < NUM_COLS; i++) {
    columnButtons.push(
      <button
        onClick={() => props.handleColumnClick(i)}
        disabled={props.isColumnDisabled(i)}
        key={i}
      >{i}</button>
    );
  }

  return (
    <>{columnButtons}</>
  );
};

const Game = observer(() => {
  const [ game ] = React.useState(new GameModel({ matchType: MatchType.Local1v1 }));

  const handleColumnClick = (column: number) => {
    const playerColor = game.matchType === MatchType.Local1v1
      ? convertTurnToCellType(game.turn)
      : game.playerProfile.color;
    
    if (game.canPlayDisc(column, playerColor)) {
      if (game.matchType === MatchType.Local1v1) {
        game.playDisc(column, playerColor);
      } else if (playerColor === convertTurnToCellType(game.turn)) {
        game.playDisc(column, convertTurnToCellType(game.turn));
      }
    }
  };
  const isColumnDisabled = (column: number): boolean => {
    return !game.canPlayDisc(column, convertTurnToCellType(game.turn));
  };

  return (
    <>
      <Board game={game} />
      <DiscDropper isColumnDisabled={isColumnDisabled} handleColumnClick={handleColumnClick} />
      <TurnDisplay turn={game.turn} />
    </>
  );
})

export { Game };