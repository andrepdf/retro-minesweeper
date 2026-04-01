import { Game } from "./game.js"
import { Terminal } from "./terminal.js";

const game = new Game();
const terminal = new Terminal("game");

terminal.render(game);

window.addEventListener("keydown", (e) => {
    game.handleInput(e.key);
    terminal.render(game);
});