import { Opponent, Move, OpponentOptions } from './Opponent';
import { NUM_COLS } from './GridModel';
import { GameModel } from './GameModel';
import { Player } from './Player';

export class DumbAI implements Opponent {
  private _self: Player;
  private _game: GameModel;

  constructor (options: OpponentOptions) {
    this._self = options.player;
    this._game = options.game;
  }

  private _makeMove(move: Move) {
    this._game.receiveOpponentMove(move);
  }

  public notifyMove(move: Move): void {
    let [isGameOver] = this._game.isOver();
    if (!isGameOver) {
      setTimeout(() => {
        const color = this._self.color;
        const availableColumns: number[] = [];
        [...Array(NUM_COLS).keys()].forEach((column) => {
          this._game.canPlayDisc(column, color) && availableColumns.push(column);
        });
        const column = availableColumns[Math.floor(Math.random() * availableColumns.length)];
  
        this._makeMove({
          color,
          column,
        });
      }, 2000);
    }
  }
}