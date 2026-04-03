import { Menu } from "./menu.js";
import { Game } from "./game.js";

const display = document.getElementById("display");

class Main {
    #menu;
    #game;
    #state; // 'M': menu ; 'G': game

    constructor() {
        this.#menu = new Menu(display);
        this.#game = new Game(display);
        this.#state = 'M';

        this.init();
    }

    /**
     * Initializes the terminal.
     * Renders the menu for the first time.
     * Controls input and manages transitions
     * between the menu and the game screen.
     */
    init() {
        this.#menu.render(display);
        
        window.addEventListener("keydown", (e) => {
            if (this.#state === 'M') {
                this.#menu.handleInput(e.key);
                if (this.#menu.isGame()) {
                    this.#state = 'G';
                    this.#game.init(this.#menu.rows, this.#menu.columns, this.#menu.density);
                    display.style.setProperty("--font-size", "3vh");
                    this.#game.render();
                } else this.#menu.render();
            } else {
                this.#game.handleInput(e.key);
                if (this.#game.isMenu()) {
                    this.#state = 'M';
                    this.#menu.init();
                    display.style.setProperty("--font-size", "3vh");
                    this.#menu.render();
                } else this.#game.render();
            }
        });
    }
}

new Main();