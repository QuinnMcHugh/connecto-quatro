import { GameModel, Result, Turn } from './GameModel';
import { NUM_ROWS, NUM_COLS, CellType } from './GridModel';

// playDisc, getFinalResult are two public methods to be tested

// detect wins of each color, detect cats games, doesn't report wins before happening

it('alternates turn', () => {
    const game = new GameModel();
    let lastTurn = game.turn;
    const numTurns = 7; // arbitrary, small enough to ensure a 4-in-a-row can't happen
    for (let i = 0; i < numTurns; i++) {
        const column = Math.floor(NUM_COLS * Math.random());
        game.playDisc(column, lastTurn === Turn.Red ? CellType.Red : CellType.Yellow);
        expect(lastTurn !== game.turn).toBe(true);
        lastTurn = game.turn;
    }
});

function convertCellTypeToResult(cellType: CellType) { 
    return cellType === CellType.Red
        ? Result.RedWin
        : cellType === CellType.Yellow
            ? Result.YellowWin
            : Result.Tie;
}
function convertCellTypeToTurn(cellType: CellType) {
    return cellType === CellType.Red
        ? Turn.Red
        : cellType === CellType.Yellow
            ? Turn.Yellow
            : Turn.GameOver;
}

function simulateGame(moves: Array<{ color: CellType, column: number }>, expectedResult: Result) {
    const game = new GameModel(convertCellTypeToTurn(moves[0].color));
    for (let i = 0; i < moves.length; i++) {
        expect(game.getFinalResult()).toBe(Result.InProgress);
        game.playDisc(moves[i].column, moves[i].color);
    }
    expect(game.getFinalResult()).toBe(expectedResult);
}

it('detects wins', () => {
    // Vertical red win
    simulateGame([
        { color: CellType.Red, column: 0 },
        { color: CellType.Yellow, column: 1 },
        { color: CellType.Red, column: 0 },
        { color: CellType.Yellow, column: 1 },
        { color: CellType.Red, column: 0 },
        { color: CellType.Yellow, column: 1 },
        { color: CellType.Red, column: 0 },
    ], Result.RedWin);

    // Horizontal yellow win
    simulateGame([
        { color: CellType.Yellow, column: 2 },
        { color: CellType.Red, column: 2 },
        { color: CellType.Yellow, column: 3 },
        { color: CellType.Red, column: 3 },
        { color: CellType.Yellow, column: 4 },
        { color: CellType.Red, column: 4 },
        { color: CellType.Yellow, column: 5 },
    ], Result.YellowWin);

    // Diagonal red win
    simulateGame([
        { color: CellType.Yellow, column: 3 },
        { color: CellType.Red, column: 3 },
        { color: CellType.Yellow, column: 4 },
        { color: CellType.Red, column: 3 },
        { color: CellType.Yellow, column: 5 },
        { color: CellType.Red, column: 3 },
        { color: CellType.Yellow, column: 4 },
        { color: CellType.Red, column: 4 },
        { color: CellType.Yellow, column: 1 },
        { color: CellType.Red, column: 5 },
        { color: CellType.Yellow, column: 5 },
        { color: CellType.Red, column: 6 },
    ], Result.RedWin);

    // Horizontal yellow win, elevated above bottom column
    simulateGame([
        { color: CellType.Yellow, column: 1 },
        { color: CellType.Red, column: 2 },
        { color: CellType.Yellow, column: 3 },
        { color: CellType.Red, column: 4 },
        { color: CellType.Yellow, column: 2 },
        { color: CellType.Red, column: 5 },
        { color: CellType.Yellow, column: 3 },
        { color: CellType.Red, column: 6 },
        { color: CellType.Yellow, column: 4 },
        { color: CellType.Red, column: 5 },
        { color: CellType.Yellow, column: 1 },
    ], Result.YellowWin);
});

it('detects ties', () => {
    // Series of alternating discs per row with no winner
    simulateGame([
        { color: CellType.Yellow, column: 0 },
        { color: CellType.Red, column: 1 },
        { color: CellType.Yellow, column: 2 },
        { color: CellType.Red, column: 3 },
        { color: CellType.Yellow, column: 4 },
        { color: CellType.Red, column: 5 },
        { color: CellType.Yellow, column: 6 },
        { color: CellType.Red, column: 0 },
        { color: CellType.Yellow, column: 1 },
        { color: CellType.Red, column: 2 },
        { color: CellType.Yellow, column: 3 },
        { color: CellType.Red, column: 4 },
        { color: CellType.Yellow, column: 5 },
        { color: CellType.Red, column: 6 },
        { color: CellType.Yellow, column: 0 },
        { color: CellType.Red, column: 1 },
        { color: CellType.Yellow, column: 2 },
        { color: CellType.Red, column: 3 },
        { color: CellType.Yellow, column: 4 },
        { color: CellType.Red, column: 5 },
        { color: CellType.Yellow, column: 6 },
        { color: CellType.Yellow, column: 0 },
        { color: CellType.Red, column: 1 },
        { color: CellType.Yellow, column: 2 },
        { color: CellType.Red, column: 3 },
        { color: CellType.Yellow, column: 4 },
        { color: CellType.Red, column: 5 },
        { color: CellType.Yellow, column: 6 },
        { color: CellType.Yellow, column: 0 },
        { color: CellType.Red, column: 1 },
        { color: CellType.Yellow, column: 2 },
        { color: CellType.Red, column: 3 },
        { color: CellType.Yellow, column: 4 },
        { color: CellType.Red, column: 5 },
        { color: CellType.Yellow, column: 6 },
        { color: CellType.Red, column: 0 },
        { color: CellType.Yellow, column: 1 },
        { color: CellType.Red, column: 2 },
        { color: CellType.Yellow, column: 3 },
        { color: CellType.Red, column: 4 },
        { color: CellType.Yellow, column: 5 },
        { color: CellType.Red, column: 6 },
    ], Result.Tie);
});