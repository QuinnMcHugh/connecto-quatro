import { Turn, GameModel, MatchType } from './GameModel';

interface ITurnDisplayProps {
  turn: Turn;
}

const TurnDisplay = (props: ITurnDisplayProps) => {
  const message = props.turn === Turn.GameOver
    ? 'Game Over'
    : props.turn;
  return <p><b>Turn</b>: {message}</p>;
};

interface IInGameMenu {
  onInitiateRematch: () => void;
  onNavigateMainMenu: () => void;
  game: GameModel;
}

export const InGameMenu = (props: IInGameMenu) => {
  const handleRematchClick = () => {
    props.onInitiateRematch();
  };
  const handleMainMenuClick = () => {
    props.onNavigateMainMenu();
  };

  const nonLocalOpponent = props.game.matchType !== MatchType.Local1v1;
  const playerColor = nonLocalOpponent && <p><b>Your color</b>: {props.game.playerProfile.color}</p>;

  const gameType = <h3 className="match-type">{props.game.matchType}</h3>;
  const rematch = <p><a href="#rematch" onClick={handleRematchClick}>Rematch &#8635;</a></p>;
  const mainMenu = <p><a href="#menu" onClick={handleMainMenuClick}>Main Menu &#8594;</a></p>;

  return (
    <div className="in-game-menu">
      { gameType }
      <div className="colors">
        { nonLocalOpponent && playerColor }
        <TurnDisplay turn={props.game.turn} />
      </div>
      <div className="actions">
        { props.game.turn === Turn.GameOver && rematch }
        { mainMenu }
      </div>
    </div>
  );
};