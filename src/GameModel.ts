import { makeAutoObservable } from 'mobx';
import { GridModel, CellType, NUM_COLS, NUM_ROWS, FOUR, Coordinate } from './GridModel';
import { Player } from './Player';
import { Opponent, Move } from './Opponent';
import { DumbAI } from './DumbAI';

export enum Turn {
  Yellow = 'Yellow',
  Red = 'Red',
  GameOver = 'GameOver',
};

export enum Result {
  RedWin = 'Red',
  YellowWin = 'Yellow',
  Tie = 'Tie',
  InProgress = 'InProgress',
};

export enum MatchType {
  Local1v1 = 'Local match',
  Remote1v1 = 'Remote match',
  AI = 'AI match',
};

export function convertTurnToCellType(turn: Turn) {
  return turn === Turn.Red
      ? CellType.Red
      : turn === Turn.Yellow
          ? CellType.Yellow
          : CellType.Empty;
}

export function oppositeCellType(input: CellType) {
  return input === CellType.Empty
    ? CellType.Empty
    : input === CellType.Red
      ? CellType.Yellow
      : CellType.Red;
}

export function convertCellTypeToTurn(cellType: CellType) {
  return cellType === CellType.Red
      ? Turn.Red
      : cellType === CellType.Yellow
          ? Turn.Yellow
          : Turn.GameOver;
}

interface GameModelOptions {
  startTurn?: Turn;
  matchType?: MatchType;
}

export class GameModel {
  private _grid: GridModel;
  private _turn: Turn;
  private _matchType: MatchType;
  
  /* Used for AI or Remote games */
  private _playerProfile: Player;
  private _opponent: Opponent;

  constructor(options: GameModelOptions) {
    this._grid = new GridModel();
    this._turn = options.startTurn ?? this._pickRandomColor();
    this._matchType = options.matchType ?? MatchType.Local1v1;

    if (this._matchType !== MatchType.Local1v1) {
      // Randomly assign colors
      const colorP1 = convertTurnToCellType(this._pickRandomColor());
      const colorP2 = oppositeCellType(colorP1);

      this._playerProfile = new Player({
        color: colorP1,
      });
      if (this._matchType === MatchType.AI) {
        this._opponent = new DumbAI({
          player: new Player({ color: colorP2 }),
          game: this,
        });

        // AI goes first
        if (convertTurnToCellType(this._turn) === colorP2) {
          this._getOpponentMove();
        }
      } else if (this._matchType === MatchType.Remote1v1) {
        // ToDo: create a remote connection object
      }
    }

    makeAutoObservable(this);
  }

  private _pickRandomColor(): Turn {
    return Math.random() < 0.5
      ? Turn.Red
      : Turn.Yellow;
  }

  get turn(): Turn {
    return this._turn;
  }

  get rows(): Array<Array<CellType>> {
    return this._grid.rows;
  }

  get matchType(): MatchType {
    return this._matchType;
  }

  get playerProfile(): Player {
    return this._playerProfile;
  }

  private _noOpenSpots(): boolean {
    return !this._grid.rows[0].some((cell: CellType) => cell === CellType.Empty);
  }

  private _isOver(): [boolean, Result] {
    const winner = this._getWinner();
    const isTie = winner === CellType.Empty && this._noOpenSpots();
    const gameOver = winner !== CellType.Empty || isTie;

    let result: Result = Result.InProgress;
    if (gameOver) {
      result = isTie
        ? Result.Tie
        : winner === CellType.Red
          ? Result.RedWin
          : Result.YellowWin;
    }

    return [ gameOver, result ];
  }

  public canPlayDisc(column: number, color: CellType): boolean {
    return color !== CellType.Empty
      && convertTurnToCellType(this.turn) === color
      && this._grid.isColumnAvailable(column);
  }

  public playDisc(column: number, color: CellType) {
    this._grid.placeDisc(column, color);

    // Compute next turn
    let [isGameOver] = this._isOver();
    if (isGameOver) {
      this._turn = Turn.GameOver;
    } else {
      this._turn = color === CellType.Red
        ? Turn.Yellow
        : Turn.Red;
    }

    const isOpponentsTurn = this.matchType !== MatchType.Local1v1
      && this._turn !== convertCellTypeToTurn(this._playerProfile.color)
      && this._turn !== Turn.GameOver;
    if (isOpponentsTurn) {
      this._getOpponentMove();
    }
  }

  private _getOpponentMove() {
    this._opponent.getMove().then((move: Move) => {
      if (this.canPlayDisc(move.column, move.color)) {
        this.playDisc(move.column, move.color);
      } else {
        throw Error(`Can't place opponent move: ${move.color} in column ${move.column}`);
      }
    }).catch(err => {
      console.log(err);
    });
  }

  public getFinalResult(): Result {
    return this._isOver()[1];
  }

  private _getWinner(): CellType {
    const winningPieces = this.getWinningPieces();
    if (winningPieces && winningPieces.length) {
      const first = winningPieces[0];
      return this._grid.rows[first.row][first.column];
    } else {
      return CellType.Empty;
    }
  }

  public getWinningPieces(): Array<Coordinate> {
    const rows = this._grid.rows;

    // iterate through rows
    for (let row = 0; row < NUM_ROWS; row++) {
      for (let start = 0; start <= NUM_COLS - FOUR; start++) {
        const first = rows[row][start],
          second = rows[row][start + 1],
          third = rows[row][start + 2],
          fourth = rows[row][start + 3];
        if (first === second && second === third
            && third === fourth && fourth !== CellType.Empty) {
            return [
              { row, column: start },
              { row, column: start + 1 },
              { row, column: start + 2 },
              { row, column: start + 3 },
            ];
        }
      }
    }

    // iterate through columns
    for (let col = 0; col < NUM_COLS; col++) {
      for (let start = 0; start <= NUM_ROWS - FOUR; start++) {
        const first = rows[start][col],
          second = rows[start + 1][col],
          third = rows[start + 2][col],
          fourth = rows[start + 3][col];
        if (first === second && second === third
            && third === fourth && fourth !== CellType.Empty) {
            return [
              { row: start, column: col },
              { row: start + 1, column: col },
              { row: start + 2, column: col },
              { row: start + 3, column: col },
            ];
        }
      }
    }

    // Check possible diagonals, both ways
    // 1. left-to-right and top-to-bottom diagonals, beginning with lines that touch the bottom
    for (let col = FOUR - 1; col < NUM_COLS; col++) {
      for (let offset = 0; offset <= (col + 1 - FOUR) - (col >= NUM_ROWS ? col - NUM_ROWS + 1 : 0); offset++) { // todo: this math may have to be reconsidered when variable dimensions are introduced
        const startRow = (NUM_ROWS - 1) - offset,
          startCol = col - offset;
        const first = rows[startRow][startCol],
          second = rows[startRow - 1][startCol - 1],
          third = rows[startRow - 2][startCol - 2],
          fourth = rows[startRow - 3][startCol - 3];
        if (first === second && second === third
            && third === fourth && fourth !== CellType.Empty) {
            return [
              { row: startRow, column: startCol },
              { row: startRow - 1, column: startCol - 1 },
              { row: startRow - 2, column: startCol - 2 },
              { row: startRow - 3, column: startCol - 3 },
            ];
        }
      }
    }
    // 2. left-to-right and top-to-bottom diagonals, resuming with the next line touching the top
    const nextCol = NUM_COLS - NUM_ROWS + 1;
    for (let col = nextCol; col <= NUM_COLS - FOUR; col++) {
      for (let offset = 0; offset <= NUM_COLS - col - FOUR; offset++) {
        const first = rows[0 + offset][col + offset],
          second = rows[1 + offset][col + offset + 1],
          third = rows[2 + offset][col + offset + 2],
          fourth = rows[3 + offset][col + offset + 3];
        if (first === second && second === third
            && third === fourth && fourth !== CellType.Empty) {
            return [
              { row: offset, column: col + offset },
              { row: offset + 1, column: col + offset + 1 },
              { row: offset + 2, column: col + offset + 2 },
              { row: offset + 3, column: col + offset + 3 },
            ];
        }
      }
    }
    // 3. right-to-left and top-to-bottom diagonals, beginning with lines that touch the bottom
    for (let col = NUM_COLS - FOUR; col >= 0; col--) {
      for (let offset = 0; offset <= (NUM_COLS - col - FOUR) - (NUM_COLS - col > NUM_ROWS ? (NUM_COLS - col) - NUM_ROWS : 0); offset++) { // todo: re-evaluate this logic when moving to a dynamic grid size
        const startCol = col + offset,
          startRow = NUM_ROWS - 1 - offset;
        const first = rows[startRow][startCol],
          second = rows[startRow - 1][startCol + 1],
          third = rows[startRow - 2][startCol + 2],
          fourth = rows[startRow - 3][startCol + 3];
        if (first === second && second === third
            && third === fourth && fourth !== CellType.Empty) {
            return [
              { row: startRow, column: startCol },
              { row: startRow - 1, column: startCol + 1 },
              { row: startRow - 2, column: startCol + 2 },
              { row: startRow - 3, column: startCol + 3 },
            ];
        }
      }
    }
    // 4. right-to-left and top-to-bottom diagonals, resuming with the next line touching the top
    for (let col = NUM_ROWS - 2; col >= FOUR - 1; col--) {
      for (let offset = 0; offset <= col - FOUR + 1; offset++) {
        const first = rows[0][col],
          second = rows[1][col - 1],
          third = rows[2][col - 2],
          fourth = rows[3][col - 3];
        if (first === second && second === third
            && third === fourth && fourth !== CellType.Empty) {
            return [
              { row: 0, column: col },
              { row: 1, column: col - 1 },
              { row: 2, column: col - 2 },
              { row: 3, column: col - 3 },
            ];
        }
      }
    }

    return [];
  }
}