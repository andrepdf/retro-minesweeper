import { Board } from "./board.js"
import { CONFIG, SYMBOL } from "./constants.js"

export class Game {
    #display;
    #timeouts;
    #board;
    #cursorX;
    #cursorY;
    #menu; // True: return to menu; False: stay on game
    #startTime;
    #timerInterval;
    #finalTime;

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
        this.#stopTimer();
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
            this.#stopTimer();
            this.#menu = true;
            this.#stopAnimations();
        } else if (key === 'R') {
            this.#stopTimer();
            this.#board.init();
            this.#stopAnimations();
        } else if (this.#board.isOver()) {
            return;
        } else if (this.#board.isReady()) {
            if (key === 'D') {
                this.#board.plantBombs(this.#cursorX, this.#cursorY, CONFIG.SAFE_RADIUS);
                this.#board.digCell(this.#cursorX, this.#cursorY);
                this.#startTimer();
            }
        } else if (key === 'D') {
            this.#board.digCell(this.#cursorX, this.#cursorY);
            if (this.#board.isOver()) {
                this.#stopTimer();
                if (this.#board.isLost())
                    this.#gameOverL();
                else this.#gameOverW();
            }
        } else if (key === 'F') {
            this.#board.toggleFlag(this.#cursorX, this.#cursorY);
        }
    }

    /**
     * Renders the current board and the cursor position.
     */
    render() {
        let out = this.#drawHeader();
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
     * Resets current timer.
     * Starts a new 1 second interval timer.
     * @private
     */
    #startTimer() {
        this.#stopTimer();
        this.#startTime = Date.now();
        this.#timerInterval = setInterval(() => {
            this.render();
        }, 1000)
    }

    /**
     * Stops the timer and saves the final time.
     * @private
     */
    #stopTimer() {
        this.#finalTime = Date.now() - this.#startTime;
        clearInterval(this.#timerInterval);
        this.#timerInterval = null;
    }

    /**
     * Builds a string representing the header of
     * the game. It includes a flag count and a timer.
     * Example: "  999  |  00:00"
     * @private
     * @returns {string} A string representing the header.
     */
    #drawHeader() {
        let header = "";

        const flags = String(this.#board.flags).padStart(6);
        let seconds = 0;
        if (this.#board.isPlaying())
            seconds = Math.floor((Date.now() - this.#startTime) / 1000);
        else if (this.#board.isOver())
            seconds = Math.floor(this.#finalTime / 1000);
        const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
        seconds = String(Math.floor(seconds % 60)).padStart(2, '0');
        header += `<span class="game-header">${flags}  |  ${minutes}:${seconds} </span>`;

        return header;
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
                delay += 200;
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
        const finalSize = 0.85 * Math.min(sizeByWidth, sizeByHeight);

        this.#display.style.fontSize = `${finalSize}vmin`
        this.#display.style.lineHeight = `${finalSize * 1.6}vmin`
    }
}   