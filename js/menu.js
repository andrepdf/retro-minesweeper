import { DIFFICULTY, CONFIG } from "./constants.js";

export class Menu {
    #display;
    #vIndex; // 0: difficulty ; 1: rows ; 2: columns ; 3: density ; 4: play
    #dIndex; // 0: easy ; 1: normal ; 2: hard ; 3: custom
    #rows;
    #columns;
    #density;
    #game; // True: start game; False: stay on menu

    constructor(display) {
        this.#display = display;
        this.init();
    }

    // Getters
    get rows() { return this.#rows; }
    get columns() { return this.#columns; }
    get density() { return this.#density; }

    // Checks
    isGame() { return this.#game; }
    isCustom() { return this.#dIndex === 3; }
    
    /**
     * Initializes the menu with default settings.
     */
    init() {
        this.#setDifficulty(DIFFICULTY.EASY);
        this.#game = false;
        this.#vIndex = 0;
        this.#dIndex = 0;
        this.#display.style.fontSize = "var(--font-size)";
        this.#display.style.lineHeight = "var(--line-height)";
    }

    /**
     * Handles keyboard input for menu logic.
     * @param {string} key - Keyboard input. 
     */
    handleInput(key) {
        if (key === "ArrowUp") {
            this.#vIndex = Math.max(0, this.#vIndex - 1);
        } else if (key === "ArrowDown") {
            this.#vIndex = Math.min(4, this.#vIndex + 1);
        } else if (this.#vIndex === 0) {
            if (key === "ArrowLeft") {
                this.#dIndex = Math.max(0, this.#dIndex - 1);
            } else if (key === "ArrowRight") {
                this.#dIndex = Math.min(3, this.#dIndex + 1);
            }
            if (this.#dIndex != 3) {
                const diffs = [DIFFICULTY.EASY, DIFFICULTY.NORMAL, DIFFICULTY.HARD];
                this.#setDifficulty(diffs[this.#dIndex]);
            }
        } else if (this.#vIndex === 4) {
            if (key.toUpperCase() === 'D')
                this.#game = true;
        } else if (this.#dIndex === 3) {
             if (this.#vIndex === 1) {
                if (key === "ArrowLeft") {
                    this.#rows = Math.max(CONFIG.MIN_ROWS, this.#rows - 1);
                } else if (key === "ArrowRight") {
                    this.#rows = Math.min(CONFIG.MAX_ROWS, this.#rows + 1);
                }
            } else if (this.#vIndex === 2) {
                if (key === "ArrowLeft") {
                    this.#columns = Math.max(CONFIG.MIN_COLUMNS, this.#columns - 1);
                } else if (key === "ArrowRight") {
                    this.#columns = Math.min(CONFIG.MAX_COLUMNS, this.#columns + 1);
                }
            } else if (this.#vIndex === 3) {
                if (key === "ArrowLeft") {
                    this.#density = Math.max(CONFIG.MIN_DENSITY, this.#density - 1);
                } else if (key === "ArrowRight") {
                    this.#density = Math.min(CONFIG.MAX_DENSITY, this.#density + 1);
                }
            }
        }
    }

    /**
     * Renders the menu and the selected button.
     */
    render() {
        const diffs = ["Easy", "Normal", "Hard", "Custom"];
        let out = '<span style="font-weight:bold">Game Configuration</span>\n\n';

        // Difficulty
        const LB = (this.#vIndex === 0) ? "> " : "[ ";
        const RB = (this.#vIndex === 0) ? " <" : " ]";
        for (let i = 0; i <= 3; i++) {
            const isSelected = this.#dIndex === i;
            const sep = (i === 3) ? "\n\n" : " | ";
            out += `${isSelected ? LB : "  "}${diffs[i]}${isSelected ? RB : "  "}${sep}`;
        }

        // Sliders
        let prefix = `${(this.#vIndex === 1) ? ">" : ""} Rows     `;
        let suffix = `${String(this.#rows).padStart(5)} ${(this.#vIndex === 1) ? "<" : ""}`;
        let slider = (this.#dIndex === 3) ? this.#drawSlider(this.#rows, CONFIG.MIN_ROWS, CONFIG.MAX_ROWS) :  "<--LOCKED-->";
        out += `${prefix}${slider}${suffix}\n`;
        prefix = `${(this.#vIndex === 2) ? ">" : ""} Columns  `;
        suffix = `${String(this.#columns).padStart(5)} ${(this.#vIndex === 2) ? "<" : ""}`;
        slider = (this.#dIndex === 3) ? this.#drawSlider(this.#columns, CONFIG.MIN_COLUMNS, CONFIG.MAX_COLUMNS) :  "<--LOCKED-->";
        out += `${prefix}${slider}${suffix}\n`;
        prefix = `${(this.#vIndex === 3) ? ">" : ""} Density  `;
        suffix = `${String(this.#density).padStart(4)}% ${(this.#vIndex === 3) ? "<" : ""}`;
        slider = (this.#dIndex === 3) ? this.#drawSlider(this.#density, CONFIG.MIN_DENSITY, CONFIG.MAX_DENSITY) :  "<--LOCKED-->";
        out += `${prefix}${slider}${suffix}\n\n`;

        // Play button
        out += `${(this.#vIndex === 4) ? ">" : ""} Play ${(this.#vIndex === 4) ? "<" : ""}`

        this.#display.innerHTML = out;
    }

    /**
     * Sets the number of rows, columns and bomb density based on a given difficulty.
     * @private
     * @param {Object} difficulty - Difficulty object containing default board settings.
     */
    #setDifficulty(difficulty) {
        this.#rows = difficulty.ROWS;
        this.#columns = difficulty.COLUMNS;
        this.#density = difficulty.DENSITY;
    }

    /**
     * Builds a string representing a slider
     * like: "<-------|-->".
     * @private
     * @param {number} value - Current value.
     * @param {*} min - Minimum possible value.
     * @param {*} max - Maximum possible value.
     * @returns {string} A string representing the slider with the given current value.
     */
    #drawSlider(value, min, max) {
        const j = Math.round((value - min) / (max - min) * 9);
        let slider = "<";
        for (let i = 0; i < 10; i++) {
            slider += (i === j) ? "|" : "-";
        }
        slider += ">";
        return slider;
    }
}