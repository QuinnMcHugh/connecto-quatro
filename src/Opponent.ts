import { CellType } from './GridModel';
import { GameModel } from './GameModel';

export interface Move {
  column: number;
  color: CellType;
}

// two types of opponents: AI and Remote
// each has one basic piece of functionality: playing the next piece
export interface Opponent {
  getMove: () => Promise<Move>;
}