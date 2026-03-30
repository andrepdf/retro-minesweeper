const EMPTY = '<span style="color:#007700">~</span>';
const FLAG = '<span style="color:#77ff77; font-weight:bold; text-shadow: 0 0 4px #77ff77;">X</span>';
const BOMB = '<span style="color:#ff3333; font-weight:bold; text-shadow: 0 0 4px #ff3333;">O</span>'
const LB = '<span style="color:#77ff77">[</span>';
const RB = '<span style="color:#77ff77">]</span>';

const game = document.getElementById("game");

// Board Data
const rows = 16;
const cols = 16;
const bombs = 40;
const safeCells = rows * cols - bombs;
let board;

// Player Data
let playerX = 0;
let playerY = 0;
let flags = bombs;
let isGame = true;
let isFirstPlay = true;
let isWon = false;
let isOver = false;

function createEmptyBoard() {
    const fontSize = rows > 13 ? (230 / rows) + "px" : "18px";
    game.style.setProperty('--terminal-font-size', fontSize);

    board = [];
    for (let y = 0; y < rows; y++) {
        let row = [];
        for (let x = 0; x < cols; x++) {
            row.push({
                value: 0,
                flagged: false,
                visible: false
            });
        }
        board.push(row);
    }
}

function placeBombs(safeX, safeY) {
    let remainingBombs = bombs;
    while (remainingBombs > 0) {
        let x = Math.floor(Math.random() * cols);
        let y = Math.floor(Math.random() * rows);
        let cell = board[y][x];
        if (cell.value === 9) continue;
        if (Math.abs(x - safeX) < 2 && Math.abs(y - safeY) < 2) continue;
        cell.value = 9;
        remainingBombs--;
    }
}

function updateNumbers() {
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            let cell = board[y][x];
            if (cell.value === 9) continue;
            cell.value = countAdjacent(x, y, c => c.value === 9);
        }
    }
}

function countVisibleCells() {
    let count = 0;
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (board[y][x].visible) count++;
        }
    }
    return count;
}

function countAdjacent(x, y, condition) {
    let count = 0;
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            let ix = x + dx;
            let iy = y + dy;
            if (ix < 0 || ix >= cols || iy < 0 || iy >= rows) continue;
            if (condition(board[iy][ix])) count++;
        }
    }
    return count;
}

function gameWon() {
    isGame = false;
    // TODO
}

function gameOver() {
    isGame = false;
    game.classList.add("shake");
    game.addEventListener("animationend", () => {
        game.classList.remove("shake");
    }, { once: true });

    let delay = 200;
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            let cell = board[y][x];
            if (cell.value != 9 || cell.flagged) continue;
            setTimeout(() => { cell.visible = true; renderBoard() }, delay);
            delay += 200;
        }
    }
}

function renderBoard() {
    let output = "";
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            let cell = board[y][x];
            let char;
            if (cell.flagged)
                char = FLAG;
            else if (!cell.visible)
                char = EMPTY;
            else if (cell.value === 0)
                char = ' ';
            else if (cell.value === 9)
                char = BOMB;
            else
                char = cell.value;
            if (x === playerX && y === playerY)
                output += LB + char + RB;
            else
                output += ' ' + char + ' ';
        }
        output += '\n';
    }
    game.innerHTML = output;
}

function digCell(x, y) {
    let cell = board[y][x];
    if (cell.flagged) return false;
    if (cell.visible) {
        if (cell.value != 0 && cell.value <= countAdjacent(x, y, c => c.flagged))
            digAdjacent(x, y);
        return true;
    }
    cell.visible = true;
    if (cell.value === 9) {
        isOver = true;
        return true;
    }
    isWon = countVisibleCells() === safeCells;
    if (cell.value != 0) return true;
    digAdjacent(x, y);
    return true;
}

function digAdjacent(x, y) {
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            let ix = x + dx;
            let iy = y + dy;
            if (ix < 0 || ix >= cols || iy < 0 || iy >= rows) continue;
            let cell = board[iy][ix];
            if (cell.visible || cell.flagged) continue;
            digCell(ix, iy);
        }
    }
}

function placeFlag(x, y) {
    let cell = board[y][x];
    if (cell.visible) return false;
    cell.flagged = !cell.flagged;
    return true;
}

function handleInput(input) {
    if (input === "ArrowUp")
        playerY = Math.max(0, playerY - 1);
    else if (input === "ArrowDown")
        playerY = Math.min(rows - 1, playerY + 1);
    else if (input === "ArrowLeft")
        playerX = Math.max(0, playerX - 1);
    else if (input === "ArrowRight")
        playerX = Math.min(cols - 1, playerX + 1);
    else if (input.toUpperCase() === "R") {
        createEmptyBoard();
        isFirstPlay = true;
        isGame = true;
        isWon = false;
        isOver = false;
    }
    else if (!isGame)
        return false;
    else if (isFirstPlay) {
        if (input.toUpperCase() != 'D') return false;
        placeBombs(playerX, playerY);
        updateNumbers();
        digCell(playerX, playerY);
        isFirstPlay = false;
    }
    else if (input.toUpperCase() === 'D')
        return digCell(playerX, playerY);
    else if (input.toUpperCase() === 'F')
        return placeFlag(playerX, playerY)
    else
        return false;
    return true;
}

game.focus();
createEmptyBoard();
renderBoard();

game.addEventListener("keydown", (e) => {
    if (handleInput(e.key)) {
        if (isGame) {
            if (isWon) gameWon();
            else if (isOver) gameOver();
        }
        renderBoard();
    }
});