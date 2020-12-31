import { GridModel, CellType, NUM_ROWS, NUM_COLS } from './GridModel';

const grid = new GridModel();

it('initializes to empty', () => {
    expect(
      grid.rows.map(row => row.filter(cell => cell !== CellType.Empty)).reduce((prev, curr) => [...prev, ...curr], []).length
    ).toEqual(0);
});

it('can place disc', () => {
    grid.placeDisc(0, CellType.Red);
    expect(grid.rows[NUM_ROWS - 1][0]).toEqual(CellType.Red);

    grid.placeDisc(1, CellType.Yellow);
    expect(grid.rows[NUM_ROWS - 1][1]).toEqual(CellType.Yellow);

    grid.placeDisc(1, CellType.Red);
    expect(grid.rows[NUM_ROWS - 2][1]).toEqual(CellType.Red);
});

it('can determine column availability', () => {
    // all should be currently available
    for (let col = 0; col < NUM_COLS; col++) {
        expect(grid.isColumnAvailable(col)).toBe(true);
    }

    // pick a column, pile discs in, expect unavailability once zeroth row reached
    const column = 0;
    let lastDisc = CellType.Red;
    for (let count = 1; grid.isColumnAvailable(column) && count <= NUM_ROWS; count++) {
        let nextDisc: CellType = lastDisc === CellType.Red ? CellType.Yellow : CellType.Red;
        grid.placeDisc(column, nextDisc);
        lastDisc = nextDisc;
    }

    // all but one should be available
    for (let col = 0; col < NUM_COLS; col++) {
        expect(grid.isColumnAvailable(col)).toBe(col !== column);
    }
});