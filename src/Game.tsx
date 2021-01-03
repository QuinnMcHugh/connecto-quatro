import React from 'react';
import { observer } from 'mobx-react-lite';

import { GameModel, Turn, convertTurnToCellType, MatchType } from './GameModel';
import { Board } from './Board';
import { DiscDropper } from './DiscDropper';
import { CellType } from './GridModel';
import { GameMenu } from './GameMenu';
import { InGameMenu } from './InGameMenu';

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

const isColumnPlayable = (column: number, game: GameModel) => {
  return game.canPlayDisc(column, convertTurnToCellType(game.turn));
};

export const Game = observer(() => {
  const [ showMenu, setShowMenu ] = React.useState(true);
  const [ showGame, setShowGame ] = React.useState(false);
  const [ game, setGame ] = React.useState<GameModel>();
  const [ hoveredColumn, setHoveredColumn ] = React.useState<number>(-1);

  const playDisc = (column: number, color: CellType) => {
    game.playDisc(column, color);
    setHoveredColumn(-1);
  };

  const handleCellHover = (column: number) => {
    const playerColor = game.matchType === MatchType.Local1v1
      ? convertTurnToCellType(game.turn)
      : game.playerProfile.color;
    const isPlayersTurn = playerColor === convertTurnToCellType(game.turn);
    if (isColumnPlayable(column, game) && isPlayersTurn) {
      setHoveredColumn(column);
    }
  };
  const handleCellClick = (column: number) => {
    if (isColumnPlayable(column, game)) {
      const playerColor = game.matchType === MatchType.Local1v1
        ? convertTurnToCellType(game.turn)
        : game.playerProfile.color;
      if (game.matchType === MatchType.Local1v1) {
        playDisc(column, playerColor);
      } else if (playerColor === convertTurnToCellType(game.turn)) {
        playDisc(column, playerColor);
      }
    }
  };
  const styleCell = (column: number, row: number): string => {
    const cell: CellType = game.rows[row][column];
    const colorClass = cell === CellType.Empty
      ? 'blank'
      : cell === CellType.Red
        ? 'red-disc'
        : 'yellow-disc'; // ToDo: how to define these class references in TS?
    
    let backgroundClass = '';
    const winningPieces = game.getWinningPieces();
    if (winningPieces.length
        && winningPieces.some(piece => piece.column === column && piece.row === row)) {
      backgroundClass = 'winning-disc';
    }
    return `cell ${colorClass} ${backgroundClass}`;
  };
  const handleMenuSelection = (selectedGameType: string) => {
    // spawn new game of selecteGameType, hide menu
    setShowMenu(false);

    if (selectedGameType === MatchType.Local1v1) {
      setGame(new GameModel({
        matchType: MatchType.Local1v1,
      }));
    } else if (selectedGameType === MatchType.Remote1v1) {
      // ToDo, implement networked gameplay
    } else if (selectedGameType === MatchType.AI) {
      setGame(new GameModel({
        matchType: MatchType.AI,
      }));
    }
    setShowGame(true);
  };
  const handleInitiateRematch = () => {
    setGame(new GameModel({
      matchType: game.matchType,
    }));
  };
  const handleNavigateMainMenu = () => {
    setShowGame(false);
    setShowMenu(true);
  };

  return (
    <>
      {showMenu && <GameMenu onSubmitClicked={handleMenuSelection} /> }
      {showGame && 
        <>
          <DiscDropper
            hoveredColumn={hoveredColumn}
            turn={game.turn}
          />
          <Board
            game={game}
            onCellHover={handleCellHover}
            onCellClick={handleCellClick}
            styleCell={styleCell}
          />
          <TurnDisplay turn={game.turn} />
          <InGameMenu
            onInitiateRematch={handleInitiateRematch}
            onNavigateMainMenu={handleNavigateMainMenu}
            gameState={game.turn}
          />
        </>
      }
    </>
  );
})