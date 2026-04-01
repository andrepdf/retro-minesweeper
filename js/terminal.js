const EMPTY = '~';
const FLAG = 'X';
const BOMB = 'O';
const ZERO = ' ';
const LB = '[';
const RB = ']';

const MIN_ROWS = 4;
const MAX_ROWS = 20;
const MIN_COLS = 4;
const MAX_COLS = 40;
const MIN_DENSITY = 0.05;
const MAX_DENSITY = 0.40;

export class Terminal {
    #elem;

    constructor(elementId) {
        this.#elem = document.getElementById(elementId);
        this.#elem.focus();
    }

    render(game) {
        if (game.state === 'M') {
            this.#elem.style.setProperty('--grid-rows', 9);
            this.#elem.style.setProperty('--grid-cols', 16);
            this.#renderMenu(game);
        } else {
            this.#elem.style.setProperty('--grid-rows', game.board.rows);
            this.#elem.style.setProperty('--grid-cols', game.board.cols);
            this.#renderBoard(game.board, game.player);
        }
    }

    #renderMenu(game) {
        let output = "-- Game Menu --\n\n";

        // Difficulties
        const difficulties = ["Easy", "Normal", "Hard", "Custom"];
        for (let i = 0; i < 4; i++) {
            if (game.difficultyIndex === i)
                if (game.menuIndex === 0)
                    output += ">[" + difficulties[i] + "]<";
                else
                    output += "[ " + difficulties[i] + " ]";
            else
                output += "  " + difficulties[i] + "  ";
            if (i != 3)
                output += " - ";
        }
        output += '\n';

        // Parameters
        output += this.#drawSlider("Rows", game.rows, MIN_ROWS, MAX_ROWS, game.menuIndex === 1, false);
        output += this.#drawSlider("Columns", game.cols, MIN_COLS, MAX_COLS, game.menuIndex === 2, false);
        output += this.#drawSlider("Density", Math.floor(game.density * 100), Math.floor(MIN_DENSITY * 100), Math.floor(MAX_DENSITY * 100), game.menuIndex === 3, true);
        output += "\n"

        // Play Button
        output += game.menuIndex === 4 ? "> [ PLAY ] <" : "  [ PLAY ]  ";

        this.#elem.innerHTML = output;

    }

    #drawSlider(name, value, min, max, isSelected, isPercent) {
        const prefix = isSelected ? "> " : "  ";
        const suffix = isSelected ? " <" : "  ";
        let slider = "";
        const index = Math.round(((value - min) / (max - min)) * 9);
        for (let i = 0; i < 10; i++) {
            slider += i === index ? "|" : "-";
        }
        const valueStr = isPercent ? value + "%" : value + "";
        
        return (prefix + name.padEnd(8) + " <" + slider + "> " + valueStr.padStart(3, " ") + suffix + "\n");
    }

    #renderBoard(board, player) {
        if (board.rows <= 9) this.#elem.dataset.size = "large";
        else if (board.rows <= 16) this.#elem.dataset.size = "medium";
        else this.#elem.dataset.size = "small";

        const rows = board.rows;
        const cols = board.cols;
        let output = "";

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const cell = board.getCell(x, y);
                let char;
                if (cell.state === 'U')
                    char = EMPTY;
                else if (cell.state === 'F')
                    char = FLAG;
                else if (cell.value === 9)
                    char = BOMB;
                else if (cell.value === 0)
                    char = ZERO;
                else
                    char = cell.value;

                if (x === player.x && y === player.y)
                    output += LB + char + RB;
                else
                    output += ' ' + char + ' ';
            }
            output += '\n';
        }
        this.#elem.innerHTML = output;
    }
}