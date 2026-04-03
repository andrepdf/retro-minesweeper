import { Cell } from "./cell.js"

export class Board {
    #rows;
    #columns;
    #bombs;
    #grid;
    #unrevealedCells;
    #flags;
    #state; // 'R': ready ; 'P': playing ; 'W': win ; 'L': lost

    constructor(rows, columns, bombs) {
        this.config(rows, columns, bombs);
    }

    // Getters
    get rows() { return this.#rows; }
    get columns() { return this.#columns; }
    get bombs() { return this.#bombs; }
    get flags() { return this.#flags; }
    getCell(x, y) { return this.#grid[y][x]; }

    // Checks
    isReady() { return this.#state === 'R'; }
    isPlaying() { return this.#state === 'P'; }
    isWin() { return this.#state === 'W'; }
    isLost() { return this.#state === 'L'; }
    isOver() { return this.#state === 'W' || this.#state === 'L'; }
    isCell(x, y) { return x >= 0 && x < this.#columns && y >= 0 && y < this.#rows; }

    // Setters
    emptyGrid() { this.#grid = []; }

    /**
     * Updates board dimensions and bomb total.
     * Initializes board with new settings.
     * @param {number} rows - Number of rows.
     * @param {number} columns - Number of columns.
     * @param {number} bombs - Number of bombs.
     */
    config(rows, columns, bombs) {
        this.#rows = rows;
        this.#columns = columns;
        this.#bombs = bombs;
        this.init();
    }

    /**
     * Initializes board with current settings.
     * Resets flag count and sets state to "Ready".
     */
    init() {
        this.emptyGrid();
        for (let y = 0; y < this.#rows; y++) {
            let row = [];
            for (let x = 0; x < this.#columns; x++) {
                row.push(new Cell());
            }
            this.#grid.push(row);
        }
        this.#unrevealedCells = this.#rows * this.#columns - this.#bombs;
        this.#flags = this.#bombs;
        this.#state = 'R';
    }

    /**
     * Randomly plant bombs on the grid.
     * Calculates cell values and sets state to "Playing".
     * @param {number} safeX - X coordinate of the center cell.
     * @param {number} safeY - Y coordinate of the center cell.
     * @param {number} safeRadius - Distance from the center to keep safe.
     */
    plantBombs(safeX, safeY, safeRadius) {
        let placed = 0;
        while (placed < this.#bombs) {
            const x = Math.floor(Math.random() * this.#columns);
            const y = Math.floor(Math.random() * this.#rows);
            let cell = this.getCell(x, y);
            if (cell.isBomb()) continue;
            if (Math.abs(x - safeX) <= safeRadius && Math.abs(y - safeY) <= safeRadius) continue;
            cell.plantBomb();
            placed++;
        }
        this.#updateNumbers();
        this.#state = 'P';
    }

    /**
     * Attempts to dig a cell and handles game state logic.
     * If cell has no adjacent bombs, dig adjacent cells.
     * @param {number} x - X coordinate of the cell.
     * @param {number} y - Y coordinate of the cell.
     * @returns {boolean} True if cell was dug; False otherwise.
     */
    digCell(x, y) {
        let cell = this.getCell(x, y);
        if (cell.isFlagged()) return false;
        if (cell.isRevealed()) return this.#chord(x, y);
        cell.reveal();
        this.#unrevealedCells--;
        if (cell.isEmpty()) this.#digAdjacent(x, y);
        else if (cell.isBomb()) this.#state = 'L';
        else if (this.isPlaying() && this.#unrevealedCells === 0)
            this.#state = 'W';
        return true;
    }

    /**
     * Attempts to place or remove flag from a cell.
     * Updates flag count.
     * @param {number} x - X coordinate of the cell.
     * @param {number} y - Y coordinate of the cell.
     * @returns {boolean} True if a flag was placed or removed; False otherwise.
     */
    toggleFlag(x, y) {
        let cell = this.getCell(x, y);
        if (cell.isRevealed()) return false;
        cell.toggleFlag();
        this.#flags += (cell.isFlagged()) ? -1 : 1;
        return true;
    }

    /**
     * Updates the values of every cell of the grid
     * based on the number of adjacent bombs.
     * @private
     */
    #updateNumbers() {
        for (let y = 0; y < this.#rows; y++) {
            for (let x = 0; x < this.#columns; x++) {
                let cell = this.getCell(x, y);
                if (cell.isBomb()) continue;
                cell.value = this.#countAdjacent(x, y, (c => c.isBomb()));
            }
        }
    }

    /**
     * Counts how many adjacent cells satisfy a given condition.
     * @private
     * @param {number} x - X coordinate of the center cell.
     * @param {number} y - Y coordinate of the center cell.
     * @param {Function} condition - The callback function used as a condition.
     * @returns {number} The number of adjacent cells that satisfy the condition.
     */
    #countAdjacent(x, y, condition) {
        let count = 0;
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const ix = x + dx;
                const iy = y + dy;
                if (!this.isCell(ix, iy)) continue;
                if (condition(this.getCell(ix, iy))) count++;
            }
        }
        return count;
    }

    /**
     * Calls digCell() for all adjacent cells.
     * @private
     * @param {number} x - X coordinate of the center cell.
     * @param {number} y - Y coordinate of the center cell.
     */
    #digAdjacent(x, y) {
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const ix = x + dx;
                const iy = y + dy;
                if (!this.isCell(ix, iy)) continue;
                if (this.getCell(ix, iy).isRevealed()) continue;
                this.digCell(ix, iy);
            }
        }
    }

    /**
     * Attempts to chord if enough adjacent flags are placed.
     * @private
     * @param {number} x - X coordinate of the center cell.
     * @param {number} y - Y coordinate of the center cell.
     * @returns {boolean} True if there aren't enough adjacent flags placed; False otherwise.
     */
    #chord(x, y) {
        let cell = this.getCell(x, y);
        if (cell.value > this.#countAdjacent(x, y, (c => c.isFlagged()))) return false;
        this.#digAdjacent(x, y);
        return true;
    }
}