import { Turn } from './GameModel';

interface IInGameMenu {
  onInitiateRematch: () => void;
  onNavigateMainMenu: () => void;
  gameState: Turn;
}

export const InGameMenu = (props: IInGameMenu) => {
  const handleRematchClick = () => {
    props.onInitiateRematch();
  };
  const handleMainMenuClick = () => {
    props.onNavigateMainMenu();
  };

  const rematch = <a href="#rematch" onClick={handleRematchClick}>Rematch &#8635;</a>;
  const mainMenu = <a href="#menu" onClick={handleMainMenuClick}>Main Menu &#8594;</a>;
  return (
    <div>
      <p>{mainMenu}</p>
      { props.gameState === Turn.GameOver && <p>{rematch}</p> }
    </div>
  );
};