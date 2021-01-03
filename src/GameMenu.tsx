import React from 'react';
import { MatchType } from './GameModel';

interface IGameMenuProps {
  onSubmitClicked: (selectedGameType: string) => void;
}

export const GameMenu = (props: IGameMenuProps) => {
  const [selectedType, setSelectedType] = React.useState<string>(MatchType.Local1v1);

  const handleRadioButtonChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedType(event.currentTarget.value);
  };
  const handleSubmitClicked = () => {
    props.onSubmitClicked(selectedType);
  };

  return (
    <>
      <form className='game-menu'>
        <h3>Game type</h3>
        <div>
          <div>
            <input
              type="radio"
              id="local"
              name="game-type"
              value={MatchType.Local1v1}
              onChange={handleRadioButtonChange}
              defaultChecked />
            <label htmlFor="local">1 vs. 1, same computer</label>
          </div>
          <div>
            <input
              type="radio"
              id="remote"
              name="game-type"
              value={MatchType.Remote1v1}
              onChange={handleRadioButtonChange} />
            <label htmlFor="remote">1 vs. 1, invite with code</label>
          </div>
          <div>
            <input
              type="radio"
              id="ai"
              name="game-type"
              value={MatchType.AI}
              onChange={handleRadioButtonChange} />
            <label htmlFor="ai">Play an AI</label>
          </div>
        </div>
        <input type="button" value="Launch game" onClick={handleSubmitClicked} />
      </form>
    </>
  );
}