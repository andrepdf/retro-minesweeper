import { Board } from "./board.js";

const MIN_ROWS = 4;
const MAX_ROWS = 20;
const MIN_COLS = 4;
const MAX_COLS = 40;
const MIN_DENSITY = 0.05;
const MAX_DENSITY = 0.40;

export class Game {
    #state;
    #menuIndex;
    #difficultyIndex;
    #difficulties = [
            { name: "Easy", rows: 9, cols: 9, density: 0.10 },
            { name: "Normal", rows: 16, cols: 16, density: 0.15 },
            { name: "Hard", rows: 16, cols: 32, density: 0.20 }
        ]
    #rows;
    #cols;
    #density;
    #board;
    #player;

    constructor() {
        this.#state = 'M';
        this.#menuIndex = 0;
        this.#difficultyIndex = 0;
        this.#rows = 9;
        this.#cols = 9;
        this.#density = 0.10;
    }

    get state() { return this.#state; }
    get menuIndex() { return this.#menuIndex; }
    get difficultyIndex() { return this.#difficultyIndex; }
    get rows() { return this.#rows; }
    get cols() { return this.#cols; }
    get density() { return this.#density; }
    get board() { return this.#board; }
    get player() { return this.#player; }

    init() {
        const bombTotal = Math.max(4, Math.floor(this.#rows * this.#cols * this.#density));
        this.#board = new Board(this.#rows, this.#cols, bombTotal);
        this.#player = { x: 0, y: 0 };
        this.#state = 'G';
    }

    handleInput(key) {
        if (this.#state === 'M')
            this.#handleMenuInput(key);
        else
            this.#handleGameInput(key);
    }

    #handleMenuInput(key) {
        if (key === "ArrowUp")
            this.#menuIndex = Math.max(0, this.#menuIndex - 1);
        if (key === "ArrowDown")
            this.#menuIndex = Math.min(4, this.#menuIndex + 1);

        if (this.#menuIndex === 0) {
            if (key === "ArrowLeft")
                this.#difficultyIndex = Math.max(0, this.#difficultyIndex - 1);
            if (key === "ArrowRight")
                this.#difficultyIndex = Math.min(3, this.#difficultyIndex + 1);
            if (this.#difficultyIndex != 3) {
                this.#rows = this.#difficulties[this.#difficultyIndex].rows;
                this.#cols = this.#difficulties[this.#difficultyIndex].cols;
                this.#density = this.#difficulties[this.#difficultyIndex].density;
            }
        } else if (this.#menuIndex === 4) {
            if (key === "Enter" || key.toUpperCase() === 'D' || key.toUpperCase() === 'F')
                this.init();
        } else if (this.#difficultyIndex === 3) {
            if (this.#menuIndex === 1) {
                if (key === "ArrowLeft")
                    this.#rows = Math.max(MIN_ROWS, this.#rows - 1);
                if (key === "ArrowRight")
                    this.#rows = Math.min(MAX_ROWS, this.#rows + 1);
            }
            if (this.#menuIndex === 2) {
                if (key === "ArrowLeft")
                    this.#cols = Math.max(MIN_COLS, this.#cols - 1);
                if (key === "ArrowRight")
                    this.#cols = Math.min(MAX_COLS, this.#cols + 1);
            }
            if (this.#menuIndex === 3) {
                if (key === "ArrowLeft")
                    this.#density = Math.max(MIN_DENSITY, this.#density - 0.01);
                if (key === "ArrowRight")
                    this.#density = Math.min(MAX_DENSITY, this.#density + 0.01);
            }
        }
    }

    #handleGameInput(key) {
        if (key === "ArrowUp")
            this.#player.y = Math.max(0, this.#player.y - 1);
        if (key === "ArrowDown")
            this.#player.y = Math.min(this.#board.rows - 1, this.#player.y + 1);
        if (key === "ArrowLeft")
            this.#player.x = Math.max(0, this.#player.x - 1);
        if (key === "ArrowRight")
            this.#player.x = Math.min(this.#board.cols - 1, this.#player.x + 1);

        key = key.toUpperCase();

        if (key === 'R')
            this.#board.init();

        if (key === 'E') {
            this.#state = 'M';
            this.#menuIndex = 0;
        }

        if (this.#board.state === 'R') {
            if (key === 'D') {
                this.#board.placeBombs(this.#player.x, this.#player.y);
                this.#board.digCell(this.#player.x, this.#player.y);
            }
        } else if (this.#board.state === 'P') {
            if (key === 'D')
                this.#board.digCell(this.#player.x, this.#player.y);
            if (key === 'F')
                this.#board.placeFlag(this.#player.x, this.#player.y);
        }
    }
}