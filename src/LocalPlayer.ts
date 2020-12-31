import { CellType } from './GridModel';

interface Options {
  color?: CellType;
}

export class LocalPlayer {
  public color: CellType;

  constructor (options: Options) {
    this.color = options?.color || randomColor();
  }
}

const randomColor = () => {
  return Math.random() < 0.5
    ? CellType.Red
    : CellType.Yellow;
};