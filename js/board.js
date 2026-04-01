export class Board {
    #rows;
    #cols;
    #bombTotal;
    #grid;
    #state;
    #flags;
    #unrevealedCells

    constructor(rows, cols, bombTotal) {
        this.config(rows, cols, bombTotal);
    }

    get rows() { return this.#rows }
    get cols() { return this.#cols }
    get state() { return this.#state; }
    getCell(x, y) { return this.#grid[y][x]; }

    config(rows, cols, bombTotal) {
        this.#rows = rows;
        this.#cols = cols;
        this.#bombTotal = bombTotal;

        this.init();
    }

    init() {
        this.#grid = [];
        for (let y = 0; y < this.#rows; y++) {
            let row = [];
            for (let x = 0; x < this.#cols; x++) {
                row.push({
                    value: 0, // 0-8 for numbers; 9 for bomb
                    state: 'U' // Unrevealed; Revealed; Flagged
                });
            }
            this.#grid.push(row);
        }
        this.#state = 'R'; // Ready; Playing; Won; Lost
        this.#flags = this.#bombTotal;
        this.#unrevealedCells = (this.#rows * this.#cols) - this.#bombTotal;
    }

    placeBombs(safeX, safeY) {
        let placed = 0;
        while (placed < this.#bombTotal) {
            const x = Math.floor(Math.random() * this.#cols);
            const y = Math.floor(Math.random() * this.#rows);

            let cell = this.#grid[y][x];
            if (cell.value === 9) continue;
            if (Math.abs(x - safeX) < 2 && Math.abs(y - safeY) < 2) continue;

            cell.value = 9;
            placed++;
        }
        this.#updateNumbers();
        this.#state = 'P';
    }

    digCell(x, y) {
        let cell = this.#grid[y][x];
        if (cell.state === 'F') return false;
        if (cell.state === 'R') {
            if (this.#countAdjacent(x, y, c => c.state === 'F') < cell.value)
                return false;
            this.#digAdjacent(x, y);
            return true;
        }
        cell.state = 'R';
        if (cell.value === 9) {
            this.#state = 'L';
            return true;
        }
        this.#unrevealedCells--;
        if (this.#unrevealedCells === 0) this.#state = 'W';
        if (cell.value != 0) return true;
        this.#digAdjacent(x, y);
        return true;
    }

    placeFlag(x, y) {
        let cell = this.#grid[y][x];
        if (cell.state === 'R') return false;
        if (cell.state === 'F') {
            cell.state = 'U';
            this.#flags++;
        } else {
            cell.state = 'F';
            this.#flags--;
        }
        return true;
    }

    #digAdjacent(x, y) {
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const ix = x + dx;
                const iy = y + dy;
                if (ix < 0 || iy < 0 || ix >= this.#cols || iy >= this.#rows) continue;
                if (this.#grid[iy][ix].state === 'R') continue;
                this.digCell(ix, iy);
            }
        }
    }

    #updateNumbers() {
        for (let y = 0; y < this.#rows; y++) {
            for (let x = 0; x < this.#cols; x++) {
                let cell = this.#grid[y][x];
                if (cell.value === 9) continue;
                cell.value = this.#countAdjacent(x, y, c => c.value === 9);
            }
        }
    }

    #countAdjacent(x, y, filter) {
        let count = 0;
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const ix = x + dx;
                const iy = y + dy;
                if (ix < 0 || iy < 0 || ix >= this.#cols || iy >= this.#rows) continue;
                if (!filter(this.#grid[iy][ix])) continue;
                count++;
            }
        }
        return count;
    }
}