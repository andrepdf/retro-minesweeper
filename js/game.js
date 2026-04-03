import { Board } from "./board.js"
import { CONFIG, SYMBOL } from "./constants.js"

export class Game {
    #display;
    #timeouts;
    #board;
    #cursorX;
    #cursorY;
    #menu; // True: return to menu; False: stay on game

    constructor(display) {
        this.#display = display;
        this.#timeouts = [];
        this.#menu = false;
    }

    // Checks
    isMenu() { return this.#menu; }

    /**
     * Initializes board with current settings.
     * Resets cursor coordinates.
     * @param {number} rows - Number of rows.
     * @param {number} columns - Number of columns.
     * @param {number} density - Bomb density.
     */
    init(rows, columns, density) {
        this.#menu = false;
        const bombs = Math.floor(rows * columns * density / 100);
        this.#board = new Board(rows, columns, bombs);
        this.#cursorX = 0;
        this.#cursorY = 0;
        this.#adjustFontSize(rows, columns);
    }

    /**
     * Handles keyboard input for game logic.
     * @param {string} key - Keyboard input. 
     */
    handleInput(key) {
        if (key === "ArrowUp") {
            this.#cursorY = Math.max(0, this.#cursorY - 1);
        } else if (key === "ArrowDown") {
            this.#cursorY = Math.min(this.#board.rows - 1, this.#cursorY + 1);
        } else if (key === "ArrowLeft") {
            this.#cursorX = Math.max(0, this.#cursorX - 1);
        } else if (key === "ArrowRight") {
            this.#cursorX = Math.min(this.#board.columns - 1, this.#cursorX + 1);
        }
        key = key.toUpperCase();
        if (key === 'E') {
            this.#menu = true;
            this.#stopAnimations();
        } else if (key === 'R') {
            this.#board.init();
            this.#stopAnimations();
        } else if (this.#board.isOver()) {
            return;
        } else if (this.#board.isReady()) {
            if (key === 'D')
                this.#board.plantBombs(this.#cursorX, this.#cursorY, CONFIG.SAFE_RADIUS);
        } else if (key === 'D') {
            this.#board.digCell(this.#cursorX, this.#cursorY);
            if (this.#board.isLost()) {
                this.#gameOverL();
            } else if (this.#board.isWin()) {
                this.#gameOverW();
            }
        } else if (key === 'F') {
            this.#board.toggleFlag(this.#cursorX, this.#cursorY);
        }
    }

    /**
     * Renders the current board and the cursor position.
     */
    render() {
        let out = "";
        for (let y = 0; y < this.#board.rows; y++) {
            for (let x = 0; x < this.#board.columns; x++) {
                const cell = this.#board.getCell(x, y);
                const symbol = cell.symbol;
                if (x === this.#cursorX && y === this.#cursorY)
                    out += `${SYMBOL.LB}${symbol}${SYMBOL.RB}`;
                else
                    out += ` ${symbol} `;
            }
            if (y === this.#board.rows - 1) continue;
            out += "\n";
        }
        this.#display.innerHTML = out;
    }

    /**
     * Triggers the game lost animation:
     * Shakes screen and reveals all bombs one at a time.
     * @private
     */
    #gameOverL() {
        const wrapper = this.#display.parentElement; 
        wrapper.classList.add('shake');
        this.#display.classList.add("shake");
        let delay = 300;
        for (let y = 0; y < this.#board.rows; y++) {
            for (let x = 0; x < this.#board.columns; x++) {
                const cell = this.#board.getCell(x, y);
                if (!cell.isBomb() || cell.isRevealed()) continue;
                this.#timeouts.push(setTimeout(() => {
                    cell.reveal();
                    this.render(this.#display);
                }, delay))
                delay += 300;
            }
        }
    }

    /**
     * Triggers the game win animation.
     * @private
     */
    #gameOverW() {
        // TODO
    }

    /**
     * Stops all ongoing animations.
     * @private
     */
    #stopAnimations() {
        this.#timeouts.forEach(t => clearTimeout(t));
        this.#timeouts = [];
        const wrapper = this.#display.parentElement; 
        wrapper.classList.remove('shake');
    }

    /**
     * Dynamically calculates the applies the font size
     * based on the current board dimensions.
     * @private
     */
    #adjustFontSize() {
        const rootStyles = window.getComputedStyle(document.documentElement);

        const termWidth = parseFloat(rootStyles.getPropertyValue('--term-width'));
        const termHeight = parseFloat(rootStyles.getPropertyValue('--term-height'));
        const charsWidth = 0.8 * this.#board.columns;
        const charsHeight = 1.8 * this.#board.rows;

        const sizeByWidth = termWidth / charsWidth;
        const sizeByHeight = termHeight / charsHeight;
        const finalSize = 0.8 * Math.min(sizeByWidth, sizeByHeight);

        this.#display.style.fontSize = `${finalSize}vmin`
        this.#display.style.lineHeight = `${finalSize * 1.6}vmin`
    }
}   