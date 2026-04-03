export const DIFFICULTY = {
    EASY: { ROWS: 9, COLUMNS: 9, DENSITY: 12 },
    NORMAL: { ROWS: 16, COLUMNS: 16, DENSITY: 16 },
    HARD: { ROWS: 16, COLUMNS: 32, DENSITY: 20 }
}

export const CONFIG = {
    MIN_ROWS: 6,
    MAX_ROWS: 20,
    MIN_COLUMNS: 6,
    MAX_COLUMNS: 40,
    MIN_DENSITY: 5,
    MAX_DENSITY: 40,
    SAFE_RADIUS: 1
}

export const SYMBOL = {
    EMPTY: ' ',
    HIDDEN: '<span style="color:var(--green); text-shadow: 0 0 5px var(--green)">~</span>',
    FLAG: '<span style="color:var(--phosphor-green); text-shadow: 0 0 5px var(--phosphor-green)">X</span>',
    BOMB: '<span style="color:var(--red); text-shadow: 0 0 5px var(--red)">O</span>',
    LB: '<span style="color:var(--phosphor-green); text-shadow: 0 0 5px var(--phosphor-green)">[</span>',
    RB: '<span style="color:var(--phosphor-green); text-shadow: 0 0 5px var(--phosphor-green)">]</span>'
}