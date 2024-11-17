const sudoku = document.getElementById("sudoku")
const cells = Array.from(sudoku.getElementsByClassName("cell"));
const buttonList = document.getElementById("button-list");
const buttons = Array.from(buttonList.getElementsByTagName("button"));

let selectedCell = null;

const deletes = ["Escape", "Backspace"];
const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

cells.forEach(cell => {
  cell.addEventListener("click", () => {
     unselect();
     selectCell(cell);
  });
  cell.addEventListener("focus", () => {
    unselect();
    selectCell(cell);
  });
  cell.addEventListener("keydown", event => updateCellEntry(cell, event.key));
});

buttons.forEach((button, index) => {
    button.addEventListener("click", () => {
        if (!selectedCell)
            return;
        updateCellEntry(selectedCell, (index + 1).toString());
    });
});

populateSystemCells();

function unselect() {
    if (selectedCell) {
        selectedCell.classList.toggle("selected", false);
    }
    selectedCell = null;
}

function selectCell(cell) {
    cell.classList.toggle("selected", true);
    selectedCell = cell;
}

function updateCellEntry(cell, newEntry) {
    if (isSystemCell(cell))
        return;

    if (deletes.includes(newEntry) && cell.innerText) {
        newEntry = ""
    }

    if (newEntry === cell.innerText)
        return;

    if (newEntry !== "" && !numbers.includes(newEntry))
        return;

    numbers.includes(newEntry) && newEntry !== cell.innerText
    cell.innerText = newEntry;

    const checkGroups = []
    checkGroups.push(Array.from(cell.parentElement.getElementsByClassName("cell")));
    checkGroups.push(Array.from(sudoku.querySelectorAll(`.cell[data-row="${cell.dataset.row}"]`)));
    checkGroups.push(Array.from(sudoku.querySelectorAll(`.cell[data-col="${cell.dataset.col}"]`)));

    const errorList = []
    checkGroups.forEach(group => {
        const isGroupValid = isCollectionValid(group, false);
        group.forEach(cell => {
            cell.classList.remove("error");
            if (!isGroupValid) {
                errorList.push(cell);
            }
        })
    })
    errorList.forEach(cell => cell.classList.toggle("error", true));

    if (isSolved()) {
        sudoku.classList.add("solved")
    }
}

function isSystemCell(cell) {
    return cell.classList.contains("system");
}

function isCollectionValid(elementCollection, complete) {
    if (elementCollection.length != 9)
        throw new Error("Unexpected collection");

    const a = new Array(9).fill(false);
    for (const element of elementCollection) {
        const number = Number.parseInt(element.innerText);
        if (Number.isNaN(number)) {
            if (complete)
                return false;
            else
                continue;
        }
        if (a[number]) {
            return false;
        } else {
            a[number] = true;
        }
    }
    return true;
}

function isSolved() {
    const miniGrids = Array.from(sudoku.getElementsByClassName("mini-grid"));
    for (const miniGrid of miniGrids) {
        const elements = Array.from(miniGrid.getElementsByClassName("cell"))
        if (!isCollectionValid(elements, true))
            return false;
    }

    for (let i = 1; i <= 9; i++) {
        const row = Array.from(sudoku.querySelectorAll(`.cell[data-row="${i}"]`));
        if (!isCollectionValid(row, true))
            return false;        
        const col = Array.from(sudoku.querySelectorAll(`.cell[data-col="${i}"]`));
        if (!isCollectionValid(col, true))
            return false;
    }
    return true;
}

function populateSystemCells() {
    fetch("./js/data.json")
        .then(response => response.json())
        .then(data => {
            data.forEach(datum => {
                const cell = sudoku.querySelector(`.cell[data-row="${datum.row}"][data-col="${datum.col}"]`);
                cell.innerText = datum.value
                cell.classList.add("system");
            });
        });
}
