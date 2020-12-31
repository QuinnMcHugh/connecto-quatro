import { makeAutoObservable } from 'mobx';

export const NUM_ROWS = 6, NUM_COLS = 7;
export const FOUR = 4; // todo: this is the number in a row which forms a win, can be dynamic

export enum CellType {
  Yellow = 'Yellow',
  Red = 'Red',
  Empty = 'Empty',
}

export interface Coordinate {
  row: number,
  column: number,
}

export class GridModel {
  private _cells: Array<Array<CellType>>;
  
  constructor() {
    this._cells = Array(NUM_ROWS);
    for (let i = 0; i < this._cells.length; i++) {
        this._cells[i] = Array(NUM_COLS).fill(CellType.Empty);
    }
    makeAutoObservable(this);
  }
  
  public placeDisc(column: number, color: CellType) {
    if (!this.isColumnAvailable(column)) return;

    let nextAvailable = NUM_ROWS - 1;
    while (this._cells[nextAvailable][column] !== CellType.Empty) {
      nextAvailable--;
    }
    this._cells[nextAvailable][column] = color;
  }
  
  public isColumnAvailable(column: number): boolean {
    return this._cells[0][column] === CellType.Empty;
  }
  
  get rows(): Array<Array<CellType>> {
    return this._cells;
  }
}