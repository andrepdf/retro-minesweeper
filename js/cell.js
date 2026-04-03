import { SYMBOL } from "./constants.js";

export class Cell {
    #value; // 0-8: number of adjacent bombs ; 9: bomb
    #state; // 'U': unrevelead ; 'R': revealed ; 'F': flagged

    constructor() {
        this.#value = 0;
        this.#state = 'U';
    }

    // Getters
    get value() { return this.#value; }
    get state() { return this.#state; }
    get symbol() {
        if (this.isUnrevealed()) return SYMBOL.HIDDEN;
        if (this.isFlagged()) return SYMBOL.FLAG;
        if (this.isEmpty()) return SYMBOL.EMPTY;
        if (this.isBomb()) return SYMBOL.BOMB;
        return this.#value;
    }

    // Checks
    isEmpty() { return this.#value === 0; }
    isBomb() { return this.#value === 9; }
    isUnrevealed() { return this.#state === 'U'; }
    isRevealed() { return this.#state === 'R'; }
    isFlagged() { return this.#state === 'F'; }

    // Setters
    set value(v) { this.#value = v; }

    /**
     * Plants a bomb on this cell.
     * @returns {boolean} True if cell was not a bomb previously; False otherwise.
     */
    plantBomb() {
        if (this.isBomb()) return false;
        this.#value = 9;
        return true;
    }

    /**
     * Attempts to reveal cell.
     * @returns {boolean} True if state was changed; False otherwise.
     */
    reveal() {
        if (!this.isUnrevealed()) return false;
        this.#state = 'R';
        return true;
    }

    /**
     * Attempts to toggle between unrevealed and flag state.
     * @returns {boolean} True if state was changed; False otherwise.
     */
    toggleFlag() {
        if (this.isRevealed()) return false;
        this.#state = (this.isFlagged()) ? 'U' : 'F';
        return true;
    }
}