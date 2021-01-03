import { CellType } from './GridModel';

export interface PlayerOptions {
  color?: CellType;
}

export class Player {
  public color: CellType;

  constructor (options: PlayerOptions) {
    this.color = options?.color || randomColor();
  }
}

const randomColor = () => {
  return Math.random() < 0.5
    ? CellType.Red
    : CellType.Yellow;
};