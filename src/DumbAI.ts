import { Opponent, Move } from './Opponent';
import { NUM_COLS } from './GridModel';
import { GameModel } from './GameModel';
import { Player } from './Player';

interface AIOptions {
  game: GameModel;
  player: Player;
}

export class DumbAI implements Opponent {
  private _self: Player;
  private _game: GameModel;

  constructor (options: AIOptions) {
    this._self = options.player;
    this._game = options.game;
  }

  public getMove(): Promise<Move> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const color = this._self.color;
        const availableColumns: number[] = [];
        [...Array(NUM_COLS).keys()].forEach((column) => {
          this._game.canPlayDisc(column, color) && availableColumns.push(column);
        });
        const column = availableColumns[Math.floor(Math.random() * availableColumns.length)];

        resolve({
          column,
          color,
        });
      }, 2000);
    });
  }
}