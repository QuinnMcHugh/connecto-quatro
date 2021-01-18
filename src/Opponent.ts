import { CellType } from './GridModel';
import { GameModel } from './GameModel';
import { Player } from './Player';

export interface Move {
  column: number;
  color: CellType;
}

export interface OpponentOptions {
  game: GameModel;
  player: Player;
}

// two types of opponents: AI and Remote
// each has one basic piece of functionality: playing the next piece
export interface Opponent {
  notifyMove: (move: Move) => void;
}