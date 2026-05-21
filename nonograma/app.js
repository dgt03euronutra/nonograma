let boardSize = 5;
let solutionDensity = 0.4;
let solution = generateSolution(boardSize);

const grid = document.getElementById("grid");
const topClues = document.getElementById("top-clues");
const leftClues = document.getElementById("left-clues");
const livesDisplay = document.getElementById("lives");
const messageDisplay = document.getElementById("message");
const newGameButton = document.getElementById("new-game");
const sizeSelector = document.getElementById("board-size");
const difficultySelector = document.getElementById("difficulty");

const maxLives = 3;
let lives = maxLives;
let gameEnded = false;
let player = createEmptyPlayer(boardSize);

newGameButton.addEventListener("click", startNewGame);

function createEmptyPlayer(size) {
    return Array.from({ length: size }, () => Array(size).fill(0));
}

function generateSolution(size) {
    const targetCount = Math.round(size * size * solutionDensity);
    let matrix;

    do {
        const values = Array.from({ length: size * size }, (_, index) =>
            index < targetCount ? 1 : 0
        );
        shuffle(values);

        matrix = Array.from({ length: size }, (_, row) =>
            values.slice(row * size, row * size + size)
        );
    } while (!validSolution(matrix));

    return matrix;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function computeClues(line) {
    const clues = [];
    let count = 0;

    for (const value of line) {
        if (value === 1) {
            count += 1;
        } else if (count > 0) {
            clues.push(count);
            count = 0;
        }
    }

    if (count > 0) {
        clues.push(count);
    }

    return clues;
}

function computeColumnClues(matrix) {
    const columns = [];
    const width = matrix[0].length;

    for (let col = 0; col < width; col++) {
        const column = matrix.map(row => row[col]);
        columns.push(computeClues(column));
    }

    return columns;
}

function validSolution(matrix) {
    const maxGroups = 3;
    const rowGroups = matrix.map(row => computeClues(row).length);
    const columnGroups = computeColumnClues(matrix).map(clue => clue.length);

    return rowGroups.every(groups => groups <= maxGroups) &&
           columnGroups.every(groups => groups <= maxGroups);
}

function renderClueLine(container, clueValues, itemClass) {
    const clueItem = document.createElement("div");
    clueItem.classList.add(itemClass);

    if (clueValues.length === 0) {
        clueItem.textContent = " ";
    } else {
        clueValues.forEach(value => {
            const number = document.createElement("span");
            number.classList.add("clue-number");
            number.textContent = value;
            clueItem.appendChild(number);
        });
    }

    container.appendChild(clueItem);
}

function renderClues() {
    clearClues();
    topClues.style.gridTemplateColumns = `repeat(${boardSize}, 50px)`;

    const rowClues = solution.map(row => computeClues(row));
    const columnClues = computeColumnClues(solution);

    rowClues.forEach(clue => renderClueLine(leftClues, clue, "left-clue"));
    columnClues.forEach(clue => renderClueLine(topClues, clue, "top-clue"));
}

function updateLives() {
    const hearts = "♥".repeat(lives) + "♡".repeat(maxLives - lives);
    livesDisplay.textContent = `Vidas: ${hearts}`;
}

function setMessage(text, type = "") {
    messageDisplay.textContent = text;
    messageDisplay.className = type ? `message ${type}` : "message";
}

function clearGrid() {
    grid.innerHTML = "";
}

function clearClues() {
    topClues.innerHTML = "";
    leftClues.innerHTML = "";
}

function disableAllCells() {
    document.querySelectorAll(".cell").forEach(cell => {
        cell.classList.add("disabled");
        cell.dataset.clicked = "true";
    });
}

function revealSolution() {
    document.querySelectorAll(".cell").forEach(cell => {
        const row = Number(cell.dataset.row);
        const col = Number(cell.dataset.col);

        if (solution[row][col] === 1) {
            cell.classList.add("filled");
        }
    });
}

function checkWin() {
    if (gameEnded) return;

    const solved = player.every((row, rowIndex) =>
        row.every((value, colIndex) => value === solution[rowIndex][colIndex])
    );

    if (solved) {
        gameEnded = true;
        setMessage("¡Enhorabuena! Has ganado.", "win");
        disableAllCells();
    }
}

function createGrid() {
    clearGrid();
    grid.style.gridTemplateColumns = `repeat(${boardSize}, 50px)`;

    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.dataset.clicked = "false";

            cell.addEventListener("click", () => {
                handleClick(cell, row, col);
            });

            grid.appendChild(cell);
        }
    }
}

function handleClick(cell, row, col) {
    if (gameEnded || cell.dataset.clicked === "true") {
        return;
    }

    cell.dataset.clicked = "true";

    if (solution[row][col] === 1) {
        cell.classList.add("filled");
        player[row][col] = 1;
        checkWin();
    } else {
        cell.classList.add("wrong");
        lives -= 1;
        updateLives();

        if (lives <= 0) {
            gameEnded = true;
            setMessage("Has perdido. Se acabaron las vidas.", "lose");
            revealSolution();
            disableAllCells();
        } else {
            setMessage(`Fallaste. Te quedan ${lives} vidas.`);
            setTimeout(() => {
                cell.classList.remove("wrong");
            }, 500);
        }
    }
}

function getSelectedBoardSize() {
    return Number(sizeSelector.value);
}

function getSelectedDifficulty() {
    return Number(difficultySelector.value);
}

function startNewGame() {
    boardSize = getSelectedBoardSize();
    solutionDensity = getSelectedDifficulty();
    solution = generateSolution(boardSize);
    player = createEmptyPlayer(boardSize);
    lives = maxLives;
    gameEnded = false;
    setMessage("Nueva partida iniciada. Buena suerte.");
    updateLives();
    renderClues();
    createGrid();
}

renderClues();
updateLives();
createGrid();
