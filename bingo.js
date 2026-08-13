/* =========================================================
DIGICAFE BINGO
COMPLETE PLAYABLE ENGINE
========================

## POWER-UP DESIGN

1 successful daub = +1 XP
3 XP = coffee cup full
Full cup = ONE RANDOM power-up
Only that power-up can be used
Using it empties the cup
5-second cooldown
No XP during cooldown
After cooldown, brewing starts again

## POWER-UPS

🍀 Lucky Daub
Marks ONE currently called number.

⚡ Number Boost
Temporarily highlights all called numbers.

✨ Double Daub
Next successful daub gives 2 XP.

## AUTO-DAUB

Called numbers are automatically marked.
Auto-daubed numbers also generate XP.
========================================================= */

/* =========================================================
01. CONFIG
========================================================= */

const bingoConfig = {


defaultCards: 1,

minimumCards: 1,

maximumCards: 4,

pricePerCard: 10,

totalNumbers: 75,

rows: 5,

columns: 5,

drawInterval: 2200,

xpPerPowerUp: 3,

powerUpCooldown: 5,

numberBoostDuration: 5000

};

/* =========================================================
02. STATE
========================================================= */

const bingoGame = {

initialized: false,

playing: false,

gameOver: false,

autoCalling: false,

autoTimer: null,

cards: 1,

boards: [],

calledNumbers: [],

currentNumber: null,

winningCard: null,

creditsPaid: 0,

wins: 0,

autoDaub: false,

daubXP: 0,

availablePowerUp: null,

powerUpCooldown: false,

powerUpCooldownTimer: null,

powerUpCooldownRemaining: 0,

doubleDaubActive: false,

numberBoostTimer: null

};

/* =========================================================
03. ELEMENTS
========================================================= */

let bingoElements = {};

/* =========================================================
04. CREDIT SYSTEM
========================================================= */

const bingoCredits = {

storageKeys: [
    "cafeCredits",
    "digiCafeCredits",
    "digicafeCredits",
    "slotCredits"
],


getBalance() {

    if (
        window.cafeSlots &&
        typeof window.cafeSlots.balance === "number"
    ) {
        return window.cafeSlots.balance;
    }

    if (
        window.cafeSlots &&
        typeof window.cafeSlots.credits === "number"
    ) {
        return window.cafeSlots.credits;
    }

    if (
        typeof window.cafeCredits === "number"
    ) {
        return window.cafeCredits;
    }

    if (
        typeof window.digiCafeCredits === "number"
    ) {
        return window.digiCafeCredits;
    }

    if (
        typeof window.slotCredits === "number"
    ) {
        return window.slotCredits;
    }

    for (
        const key of this.storageKeys
    ) {

        const value =
            localStorage.getItem(key);

        if (
            value !== null &&
            !Number.isNaN(Number(value))
        ) {
            return Number(value);
        }

    }

    localStorage.setItem(
        "cafeCredits",
        "100"
    );

    return 100;

},


setBalance(amount) {

    amount = Math.max(
        0,
        Math.floor(
            Number(amount) || 0
        )
    );

    if (
        window.cafeSlots &&
        typeof window.cafeSlots.balance === "number"
    ) {
        window.cafeSlots.balance = amount;
    }

    if (
        window.cafeSlots &&
        typeof window.cafeSlots.credits === "number"
    ) {
        window.cafeSlots.credits = amount;
    }

    if (
        typeof window.cafeCredits === "number"
    ) {
        window.cafeCredits = amount;
    }

    if (
        typeof window.digiCafeCredits === "number"
    ) {
        window.digiCafeCredits = amount;
    }

    if (
        typeof window.slotCredits === "number"
    ) {
        window.slotCredits = amount;
    }

    localStorage.setItem(
        "cafeCredits",
        String(amount)
    );

    window.dispatchEvent(
        new CustomEvent(
            "cafeCreditsChanged",
            {
                detail: {
                    balance: amount
                }
            }
        )
    );

    return amount;

},


spend(amount) {

    const balance =
        this.getBalance();

    if (
        balance < amount
    ) {
        return false;
    }

    this.setBalance(
        balance - amount
    );

    return true;

}

};

/* =========================================================
05. PRICE / CREDIT DISPLAY
========================================================= */

function getBingoPrice() {
return (
    bingoGame.cards *
    bingoConfig.pricePerCard
);

}

function updateBingoCreditDisplay() {

const balance =
    bingoCredits.getBalance();


document
    .querySelectorAll(
        "[data-bingo-credit-balance]"
    )
    .forEach(
        element => {

            element.textContent =
                balance;

        }
    );


document
    .querySelectorAll(
        "[data-card-price]"
    )
    .forEach(
        element => {

            const option =
                element.closest(
                    "[data-card-count]"
                );

            if (!option) {
                return;
            }

            const count =
                Number(
                    option.dataset.cardCount
                );

            element.textContent =
                `${count * bingoConfig.pricePerCard} credits`;

        }
    );

}

/* =========================================================
06. ELEMENT SETUP
========================================================= */

function setupBingoElements() {

bingoElements = {

    room:
        document.getElementById(
            "bingoGame"
        ),

    cards:
        document.getElementById(
            "bingoCards"
        ),

    cardOptions:
        document.querySelectorAll(
            ".bingo-card-option"
        ),

    daubOptions:
        document.querySelectorAll(
            ".bingo-daub-option"
        ),

    cardCountLabel:
        document.getElementById(
            "bingoCardCountLabel"
        ),

    currentLetter:
        document.getElementById(
            "bingoCurrentLetter"
        ),

    currentNumber:
        document.getElementById(
            "bingoCurrentNumber"
        ),

    result:
        document.getElementById(
            "bingoResult"
        ),

    callNumber:
        document.getElementById(
            "bingoCallNumber"
        ),

    autoCall:
        document.getElementById(
            "bingoAutoCall"
        ),

    newGame:
        document.getElementById(
            "bingoNewGame"
        ),

    calledNumbers:
        document.getElementById(
            "bingoCalledNumbers"
        ),

    calledTotal:
        document.getElementById(
            "bingoCalledTotal"
        ),

    calledCount:
        document.getElementById(
            "bingoCalledCount"
        ),

    remainingCount:
        document.getElementById(
            "bingoRemainingCount"
        ),

    wins:
        document.getElementById(
            "bingoWins"
        ),

    win:
        document.getElementById(
            "bingoWin"
        ),

    winMessage:
        document.getElementById(
            "bingoWinMessage"
        ),

    finalCards:
        document.getElementById(
            "bingoFinalCards"
        ),

    finalCalled:
        document.getElementById(
            "bingoFinalCalled"
        ),

    playAgain:
        document.getElementById(
            "bingoPlayAgain"
        ),

    powerUpXP:
        document.getElementById(
            "bingoPowerupXP"
        ),

    powerUpXPText:
        document.getElementById(
            "bingoPowerupXPText"
        ),

    coffeeFill:
        document.getElementById(
            "bingoCoffeeFill"
        ),

    powerUpTimer:
        document.getElementById(
            "bingoPowerupTimer"
        ),

    powerUpStatus:
        document.getElementById(
            "bingoPowerupStatus"
        ),

    powerUpStatusIcon:
        document.getElementById(
            "bingoPowerupStatusIcon"
        ),

    powerUpStatusTitle:
        document.getElementById(
            "bingoPowerupStatusTitle"
        ),

    powerUpStatusText:
        document.getElementById(
            "bingoPowerupStatusText"
        ),

    powerUpButtons:
        document.querySelectorAll(
            ".bingo-powerup-option"
        ),

    powerUpCooldown:
        document.getElementById(
            "bingoPowerupCooldown"
        ),

    powerUpCooldownTime:
        document.getElementById(
            "bingoPowerupCooldownTime"
        )

};


return Boolean(
    bingoElements.cards
);

}

/* =========================================================
07. RANDOM / SHUFFLE
========================================================= */

function randomBingoNumber(
min,
max
) {

return Math.floor(
    Math.random() *
    (max - min + 1)
) + min;

}

function shuffleBingoArray(
array
) {

const result =
    [...array];

for (
    let i = result.length - 1;
    i > 0;
    i--
) {

    const j =
        Math.floor(
            Math.random() *
            (i + 1)
        );

    [
        result[i],
        result[j]
    ] = [
        result[j],
        result[i]
    ];

}

return result;
}

/* =========================================================
08. BINGO LETTER
========================================================= */

function getBingoLetter(
number
) {

if (number >= 1 && number <= 15) {
    return "B";
}

if (number >= 16 && number <= 30) {
    return "I";
}

if (number >= 31 && number <= 45) {
    return "N";
}

if (number >= 46 && number <= 60) {
    return "G";
}

if (number >= 61 && number <= 75) {
    return "O";
}

return "";

}

/* =========================================================
09. CREATE COLUMN
========================================================= */

function createBingoColumn(
column
) {

const ranges = [
    [1, 15],
    [16, 30],
    [31, 45],
    [46, 60],
    [61, 75]
];

const [
    min,
    max
] = ranges[column];

const numbers = [];

for (
    let number = min;
    number <= max;
    number++
) {
    numbers.push(number);
}

return shuffleBingoArray(
    numbers
).slice(0, 5);
}

/* =========================================================
10. CREATE CARD
========================================================= */

function createBingoCard() {
const card = {

    numbers: [],

    marked: []

};


const columns = [];

for (
    let column = 0;
    column < 5;
    column++
) {

    columns.push(
        createBingoColumn(
            column
        )
    );

}


for (
    let row = 0;
    row < 5;
    row++
) {

    const numbers =
        [];

    const marked =
        [];


    for (
        let column = 0;
        column < 5;
        column++
    ) {

        if (
            row === 2 &&
            column === 2
        ) {

            numbers.push(
                "FREE"
            );

            marked.push(
                true
            );

        }

        else {

            numbers.push(
                columns[column][row]
            );

            marked.push(
                false
            );

        }

    }


    card.numbers.push(
        numbers
    );

    card.marked.push(
        marked
    );

}


return card;

}

/* =========================================================
11. CREATE BOARDS
========================================================= */

function createBingoBoards() {

bingoGame.boards = [];

for (
    let i = 0;
    i < bingoGame.cards;
    i++
) {

    bingoGame.boards.push(
        createBingoCard()
    );

}

}

/* =========================================================
12. RENDER BOARDS
========================================================= */

function renderBingoBoards() {

const container =
    bingoElements.cards;

if (!container) {
    return;
}

container.innerHTML = "";


bingoGame.boards.forEach(
    (
        card,
        cardIndex
    ) => {

        const cardElement =
            document.createElement(
                "article"
            );

        cardElement.className =
            "bingo-card";

        cardElement.dataset.card =
            cardIndex;


        const title =
            document.createElement(
                "h3"
            );

        title.textContent =
            `Bingo Card ${cardIndex + 1}`;


        const grid =
            document.createElement(
                "div"
            );

        grid.className =
            "bingo-grid";


        [
            "B",
            "I",
            "N",
            "G",
            "O"
        ].forEach(
            letter => {

                const header =
                    document.createElement(
                        "div"
                    );

                header.className =
                    "bingo-cell bingo-header";

                header.textContent =
                    letter;

                grid.appendChild(
                    header
                );

            }
        );


        for (
            let row = 0;
            row < 5;
            row++
        ) {

            for (
                let column = 0;
                column < 5;
                column++
            ) {

                const value =
                    card.numbers[row][column];


                const cell =
                    document.createElement(
                        "button"
                    );

                cell.type =
                    "button";

                cell.className =
                    "bingo-cell";

                cell.textContent =
                    value;

                cell.dataset.card =
                    cardIndex;

                cell.dataset.row =
                    row;

                cell.dataset.column =
                    column;

                cell.dataset.number =
                    value;


                if (
                    value === "FREE"
                ) {

                    cell.classList.add(
                        "free",
                        "marked"
                    );

                }


                cell.addEventListener(
                    "click",
                    () => {

                        markBingoCell(
                            cardIndex,
                            row,
                            column,
                            "manual"
                        );

                    }
                );


                grid.appendChild(
                    cell
                );

            }

        }


        cardElement.appendChild(
            title
        );

        cardElement.appendChild(
            grid
        );

        container.appendChild(
            cardElement
        );

    }
);


updateCalledHighlights();

}

/* =========================================================
13. CARD COUNT
========================================================= */

function normalizeCardCount(
value
) {

const number =
    Number(value);

return Math.min(
    bingoConfig.maximumCards,
    Math.max(
        bingoConfig.minimumCards,
        Math.floor(
            number || 1
        )
    )
);

}

function updateCardCountLabel() {

if (
    !bingoElements.cardCountLabel
) {
    return;
}

bingoElements.cardCountLabel.textContent =
    `${bingoGame.cards} ${
        bingoGame.cards === 1
            ? "CARD"
            : "CARDS"
    }`;

}

function updateCardSelectionUI() {
bingoElements.cardOptions.forEach(
    button => {

        const count =
            Number(
                button.dataset.cardCount
            );

        const selected =
            count === bingoGame.cards;

        button.classList.toggle(
            "active",
            selected
        );

        button.setAttribute(
            "aria-pressed",
            selected
                ? "true"
                : "false"
        );

    }
);

updateCardCountLabel();

updateBingoCreditDisplay();

}

/* =========================================================
14. SELECT CARDS
========================================================= */

function selectBingoCardCount(
count
) {

if (
    bingoGame.playing
) {

    showBingoResult(
        "Start a new game before changing cards."
    );

    return;

}

bingoGame.cards =
    normalizeCardCount(
        count
    );

newBingoGame();

}

/* =========================================================
15. DAUB MODE
========================================================= */

function setBingoDaubMode(
mode
) {

bingoGame.autoDaub =
    mode === "auto";


bingoElements.daubOptions.forEach(
    button => {

        const active =
            button.dataset.daubMode === mode;

        button.classList.toggle(
            "active",
            active
        );

        button.setAttribute(
            "aria-pressed",
            active
                ? "true"
                : "false"
        );

    }
);


if (
    bingoGame.autoDaub &&
    bingoGame.playing
) {

    autoDaubCalledNumbers();

}


showBingoResult(
    bingoGame.autoDaub
        ? "✨ Auto-Daub ON — called numbers will be marked automatically."
        : "Manual Daub ON — tap your called numbers yourself."
);
 

}

function toggleBingoAutoDaub() {

 
setBingoDaubMode(
    bingoGame.autoDaub
        ? "manual"
        : "auto"
);
 

}

/* =========================================================
16. MARK CELL
========================================================= */

function markBingoCell(
cardIndex,
row,
column,
source = "manual"
) {

 
if (
    !bingoGame.playing ||
    bingoGame.gameOver
) {
    return false;
}


const card =
    bingoGame.boards[cardIndex];

if (!card) {
    return false;
}


const number =
    card.numbers[row][column];


if (
    number === "FREE"
) {
    return false;
}


if (
    card.marked[row][column]
) {
    return false;
}


if (
    !bingoGame.calledNumbers.includes(
        number
    )
) {

    if (
        source === "manual"
    ) {

        showBingoResult(
            `${getBingoLetter(number)}${number} has not been called yet.`
        );

    }

    return false;

}


card.marked[row][column] =
    true;


updateBingoCellVisual(
    cardIndex,
    row,
    column
);


/*
 * DOUBLE DAUB
 */

let xp =
    1;


if (
    bingoGame.doubleDaubActive
) {

    xp = 2;

    bingoGame.doubleDaubActive =
        false;

    showBingoResult(
        "✨ Double Daub activated! +2 XP"
    );

}


addDaubXP(
    xp
);


if (
    source === "manual" &&
    !bingoGame.gameOver
) {

    showBingoResult(
        `Marked ${getBingoLetter(number)}${number}. +${xp} XP ☕`
    );

}


checkBingo(
    cardIndex
);


return true;
 

}

/* =========================================================
17. CELL VISUAL
========================================================= */

function updateBingoCellVisual(
cardIndex,
row,
column
) {

 
const cell =
    document.querySelector(
        `.bingo-cell[data-card="${cardIndex}"][data-row="${row}"][data-column="${column}"]`
    );

if (!cell) {
    return;
}

const card =
    bingoGame.boards[cardIndex];

cell.classList.toggle(
    "marked",
    Boolean(
        card.marked[row][column]
    )
);
 

}

/* =========================================================
18. AUTO DAUB
========================================================= */

function autoDaubCalledNumbers() {

 
if (
    !bingoGame.playing ||
    bingoGame.gameOver
) {
    return;
}


let changed = true;


/*
 * Keep scanning because Double Daub
 * and power-up effects can alter XP.
 */

while (
    changed &&
    !bingoGame.gameOver
) {

    changed = false;


    for (
        let cardIndex = 0;
        cardIndex < bingoGame.boards.length;
        cardIndex++
    ) {

        const card =
            bingoGame.boards[
                cardIndex
            ];


        for (
            let row = 0;
            row < 5;
            row++
        ) {

            for (
                let column = 0;
                column < 5;
                column++
            ) {

                const number =
                    card.numbers[row][column];


                if (
                    number === "FREE"
                ) {
                    continue;
                }


                if (
                    bingoGame.calledNumbers.includes(
                        number
                    ) &&
                    !card.marked[row][column]
                ) {

                    const marked =
                        markBingoCell(
                            cardIndex,
                            row,
                            column,
                            "auto"
                        );


                    if (marked) {

                        changed = true;

                    }


                    if (
                        bingoGame.gameOver
                    ) {

                        return;

                    }

                }

            }

        }

    }

}
 

}

/* =========================================================
19. BINGO CHECK
========================================================= */

function checkBingo(
cardIndex
) {

 
const card =
    bingoGame.boards[cardIndex];

if (!card) {
    return false;
}


for (
    let row = 0;
    row < 5;
    row++
) {

    if (
        card.marked[row].every(
            Boolean
        )
    ) {

        winBingo(
            cardIndex,
            `row ${row + 1}`
        );

        return true;

    }

}


for (
    let column = 0;
    column < 5;
    column++
) {

    let complete =
        true;

    for (
        let row = 0;
        row < 5;
        row++
    ) {

        if (
            !card.marked[row][column]
        ) {

            complete =
                false;

            break;

        }

    }

    if (complete) {

        winBingo(
            cardIndex,
            `column ${column + 1}`
        );

        return true;

    }

}


let diagonalOne =
    true;

let diagonalTwo =
    true;


for (
    let i = 0;
    i < 5;
    i++
) {

    if (
        !card.marked[i][i]
    ) {

        diagonalOne =
            false;

    }

    if (
        !card.marked[i][4 - i]
    ) {

        diagonalTwo =
            false;

    }

}


if (diagonalOne) {

    winBingo(
        cardIndex,
        "diagonal"
    );

    return true;

}


if (diagonalTwo) {

    winBingo(
        cardIndex,
        "diagonal"
    );

    return true;

}


return false;
 

}

/* =========================================================
20. COFFEE XP
========================================================= */

function addDaubXP(
amount = 1
) {

 
/*
 * Never gather XP during cooldown.
 */

if (
    bingoGame.powerUpCooldown ||
    !bingoGame.playing ||
    bingoGame.gameOver
) {
    return;
}


/*
 * A power-up is waiting.
 * The coffee cup stays full until
 * that power-up is used.
 */

if (
    bingoGame.availablePowerUp
) {
    return;
}


bingoGame.daubXP +=
    amount;


bingoGame.daubXP =
    Math.min(
        bingoConfig.xpPerPowerUp,
        bingoGame.daubXP
    );


/*
 * Full cup!
 */

if (
    bingoGame.daubXP >=
    bingoConfig.xpPerPowerUp
) {

    brewRandomPowerUp();

}


updatePowerUpUI();
 

}

/* =========================================================
21. RANDOM POWER-UP
========================================================= */

const bingoPowerUps = [

 
"lucky-daub",

"number-boost",

"double-daub"
 

];

function brewRandomPowerUp() {

 
if (
    bingoGame.availablePowerUp ||
    bingoGame.powerUpCooldown
) {
    return;
}


const index =
    Math.floor(
        Math.random() *
        bingoPowerUps.length
    );


bingoGame.availablePowerUp =
    bingoPowerUps[index];


bingoGame.daubXP =
    bingoConfig.xpPerPowerUp;


updatePowerUpUI();


const name =
    getPowerUpName(
        bingoGame.availablePowerUp
    );


showBingoResult(
    `☕ Coffee brewed! You received ${name}!`
);
 

}

/* =========================================================
22. POWER-UP NAME
========================================================= */

function getPowerUpName(
powerUp
) {

 
const names = {

    "lucky-daub":
        "🍀 Lucky Daub",

    "number-boost":
        "⚡ Number Boost",

    "double-daub":
        "✨ Double Daub"

};


return (
    names[powerUp] ||
    "Mystery Power-Up"
);
 

}

/* =========================================================
23. POWER-UP UI
========================================================= */

function updatePowerUpUI() {

 
const required =
    bingoConfig.xpPerPowerUp;


const xp =
    bingoGame.daubXP;


const progress =
    Math.min(
        100,
        (
            xp /
            required
        ) * 100
    );


/*
 * COFFEE FILL
 */

if (
    bingoElements.coffeeFill
) {

    bingoElements.coffeeFill.style.height =
        `${progress}%`;

}


/*
 * XP TEXT
 */

if (
    bingoElements.powerUpXP
) {

    bingoElements.powerUpXP.textContent =
        `${xp} / ${required}`;

}


if (
    bingoElements.powerUpXPText
) {

    if (
        bingoGame.powerUpCooldown
    ) {

        bingoElements.powerUpXPText.textContent =
            "The coffee machine is cooling down...";

    }

    else if (
        bingoGame.availablePowerUp
    ) {

        bingoElements.powerUpXPText.textContent =
            "Your coffee is full!";

    }

    else {

        bingoElements.powerUpXPText.textContent =
            `${required - xp} more successful daub${
                required - xp === 1
                    ? ""
                    : "s"
            } to brew a power-up.`;

    }

}


/*
 * TIMER
 */

if (
    bingoElements.powerUpTimer
) {

    if (
        bingoGame.powerUpCooldown
    ) {

        bingoElements.powerUpTimer.textContent =
            `COOLDOWN ${bingoGame.powerUpCooldownRemaining}s`;

    }

    else if (
        bingoGame.availablePowerUp
    ) {

        bingoElements.powerUpTimer.textContent =
            "POWER-UP READY";

    }

    else {

        bingoElements.powerUpTimer.textContent =
            "BREWING";

    }

}


/*
 * STATUS
 */

if (
    bingoGame.powerUpCooldown
) {

    setPowerUpStatus(
        "⏳",
        "Coffee machine cooling",
        "XP collection resumes when the cooldown ends."
    );

}

else if (
    bingoGame.availablePowerUp
) {

    setPowerUpStatus(
        getPowerUpIcon(
            bingoGame.availablePowerUp
        ),
        `${getPowerUpName(bingoGame.availablePowerUp)} ready!`,
        "This is your power-up for this coffee load."
    );

}

else {

    setPowerUpStatus(
        "☕",
        "Coffee is brewing",
        "Daub 3 called numbers to receive a random power-up."
    );

}


/*
 * POWER-UP BUTTONS
 */

bingoElements.powerUpButtons.forEach(
    button => {

        const type =
            button.dataset.powerup;

        const selected =
            type ===
            bingoGame.availablePowerUp;


        button.classList.toggle(
            "selected",
            selected
        );


        const usable =
            bingoGame.playing &&
            !bingoGame.gameOver &&
            !bingoGame.powerUpCooldown &&
            selected;


        button.disabled =
            !usable;


        const label =
            button.querySelector(
                "[data-powerup-ready]"
            );


        if (label) {

            if (
                selected
            ) {

                label.textContent =
                    "READY";

            }

            else {

                label.textContent =
                    "LOCKED";

            }

        }

    }
);


/*
 * COOLDOWN DISPLAY
 */

if (
    bingoElements.powerUpCooldown
) {

    bingoElements.powerUpCooldown.hidden =
        !bingoGame.powerUpCooldown;

}

if (
    bingoElements.powerUpCooldownTime
) {

    bingoElements.powerUpCooldownTime.textContent =
        bingoGame.powerUpCooldownRemaining;

}
 

}

function setPowerUpStatus(
icon,
title,
text
) {

 
if (
    bingoElements.powerUpStatusIcon
) {

    bingoElements.powerUpStatusIcon.textContent =
        icon;

}

if (
    bingoElements.powerUpStatusTitle
) {

    bingoElements.powerUpStatusTitle.textContent =
        title;

}

if (
    bingoElements.powerUpStatusText
) {

    bingoElements.powerUpStatusText.textContent =
        text;

}
 

}

function getPowerUpIcon(
powerUp
) {

 
const icons = {

    "lucky-daub": "🍀",

    "number-boost": "⚡",

    "double-daub": "✨"

};

return (
    icons[powerUp] ||
    "☕"
);
 

}

/* =========================================================
24. CONSUME RANDOM POWER-UP
========================================================= */

function consumeSelectedPowerUp(
expectedPowerUp
) {

 
if (
    !bingoGame.playing ||
    bingoGame.gameOver
) {
    return false;
}


if (
    bingoGame.powerUpCooldown
) {

    showBingoResult(
        `⏳ Power-up cooling down for ${bingoGame.powerUpCooldownRemaining}s.`
    );

    return false;

}


if (
    bingoGame.availablePowerUp !==
    expectedPowerUp
) {

    showBingoResult(
        "☕ That power-up is not the one brewed for this load."
    );

    return false;

}


/*
 * IMPORTANT:
 *
 * The cup empties immediately.
 * No second power-up can be used from
 * the same XP load.
 */

bingoGame.availablePowerUp =
    null;


bingoGame.daubXP =
    0;


updatePowerUpUI();


return true;
 

}

/* =========================================================
25. LUCKY DAUB
========================================================= */

function useLuckyDaub() {

 
if (
    !consumeSelectedPowerUp(
        "lucky-daub"
    )
) {
    return;
}


/*
 * Find ONE random valid called number
 * across all cards.
 */

const candidates = [];


bingoGame.boards.forEach(
    (
        card,
        cardIndex
    ) => {

        for (
            let row = 0;
            row < 5;
            row++
        ) {

            for (
                let column = 0;
                column < 5;
                column++
            ) {

                const number =
                    card.numbers[row][column];


                if (
                    number !== "FREE" &&
                    bingoGame.calledNumbers.includes(
                        number
                    ) &&
                    !card.marked[row][column]
                ) {

                    candidates.push({
                        cardIndex,
                        row,
                        column
                    });

                }

            }

        }

    }
);


if (
    candidates.length === 0
) {

    showBingoResult(
        "🍀 Lucky Daub had no called number to mark."
    );

    startPowerUpCooldown();

    return;

}


const selected =
    candidates[
        Math.floor(
            Math.random() *
            candidates.length
        )
    ];


/*
 * Power-up daub does NOT create XP.
 */

const card =
    bingoGame.boards[
        selected.cardIndex
    ];


card.marked[
    selected.row
][
    selected.column
] = true;


updateBingoCellVisual(
    selected.cardIndex,
    selected.row,
    selected.column
);


showBingoResult(
    `🍀 Lucky Daub marked ${getBingoLetter(
        card.numbers[
            selected.row
        ][
            selected.column
        ]
    )}${card.numbers[
        selected.row
    ][
        selected.column
    ]}!`
);


checkBingo(
    selected.cardIndex
);


if (
    !bingoGame.gameOver
) {

    startPowerUpCooldown();

}
 

}

/* =========================================================
26. NUMBER BOOST
========================================================= */

function useNumberBoost() {

 
if (
    !consumeSelectedPowerUp(
        "number-boost"
    )
) {
    return;
}


document
    .querySelectorAll(
        ".bingo-cell[data-number]"
    )
    .forEach(
        cell => {

            const number =
                Number(
                    cell.dataset.number
                );

            if (
                bingoGame.calledNumbers.includes(
                    number
                )
            ) {

                cell.classList.add(
                    "number-boost"
                );

            }

        }
    );


showBingoResult(
    "⚡ Number Boost activated! Called numbers are glowing."
);


if (
    bingoGame.numberBoostTimer
) {

    clearTimeout(
        bingoGame.numberBoostTimer
    );

}


bingoGame.numberBoostTimer =
    setTimeout(
        () => {

            document
                .querySelectorAll(
                    ".bingo-cell.number-boost"
                )
                .forEach(
                    cell => {

                        cell.classList.remove(
                            "number-boost"
                        );

                    }
                );

        },
        bingoConfig.numberBoostDuration
    );


startPowerUpCooldown();
 

}

/* =========================================================
27. DOUBLE DAUB
========================================================= */

function useDoubleDaub() {

 
if (
    !consumeSelectedPowerUp(
        "double-daub"
    )
) {
    return;
}


bingoGame.doubleDaubActive =
    true;


showBingoResult(
    "✨ Double Daub ready! Your next successful daub gives 2 XP."
);


startPowerUpCooldown();
 

}

/* =========================================================
28. COOLDOWN
========================================================= */

function startPowerUpCooldown() {

 
if (
    bingoGame.powerUpCooldownTimer
) {

    clearInterval(
        bingoGame.powerUpCooldownTimer
    );

}


bingoGame.powerUpCooldown =
    true;


bingoGame.powerUpCooldownRemaining =
    bingoConfig.powerUpCooldown;


updatePowerUpUI();


bingoGame.powerUpCooldownTimer =
    setInterval(
        () => {

            bingoGame.powerUpCooldownRemaining--;

            updatePowerUpUI();


            if (
                bingoGame.powerUpCooldownRemaining <=
                0
            ) {

                clearInterval(
                    bingoGame.powerUpCooldownTimer
                );


                bingoGame.powerUpCooldownTimer =
                    null;


                bingoGame.powerUpCooldown =
                    false;


                bingoGame.powerUpCooldownRemaining =
                    0;


                /*
                 * Double Daub cannot survive
                 * the cooldown.
                 */

                bingoGame.doubleDaubActive =
                    false;


                updatePowerUpUI();


                showBingoResult(
                    "☕ Coffee machine ready. Start brewing your next power-up!"
                );

            }

        },
        1000
    );
 

}

/* =========================================================
29. WIN
========================================================= */

function winBingo(
cardIndex,
pattern
) {

 
if (
    bingoGame.gameOver
) {
    return;
}


bingoGame.gameOver =
    true;


bingoGame.playing =
    false;


bingoGame.winningCard =
    cardIndex;


bingoGame.wins++;


stopBingoAutoCall();


if (
    bingoElements.wins
) {

    bingoElements.wins.textContent =
        bingoGame.wins;

}


const cardElement =
    document.querySelector(
        `.bingo-card[data-card="${cardIndex}"]`
    );


if (cardElement) {

    cardElement.classList.add(
        "bingo-winner"
    );

}


const message =
    `🎉 BINGO! Card ${cardIndex + 1} completed a ${pattern}!`;


showBingoResult(
    message
);


if (
    bingoElements.win
) {

    bingoElements.win.hidden =
        false;

}


if (
    bingoElements.winMessage
) {

    bingoElements.winMessage.textContent =
        `You got BINGO on Card ${
            cardIndex + 1
        } with a ${pattern}. Nicely played, besh! ☕`;

}


if (
    bingoElements.finalCards
) {

    bingoElements.finalCards.textContent =
        bingoGame.cards;

}


if (
    bingoElements.finalCalled
) {

    bingoElements.finalCalled.textContent =
        bingoGame.calledNumbers.length;

}


updateCallButtons();

updatePowerUpUI();
 

}

/* =========================================================
30. DRAW NUMBER
========================================================= */

function drawBingoNumber() {

 
if (
    !bingoGame.playing ||
    bingoGame.gameOver
) {
    return null;
}


if (
    bingoGame.calledNumbers.length >=
    bingoConfig.totalNumbers
) {

    stopBingoAutoCall();

    showBingoResult(
        "All 75 numbers have been called."
    );

    return null;

}


let number;


do {

    number =
        randomBingoNumber(
            1,
            75
        );

} while (
    bingoGame.calledNumbers.includes(
        number
    )
);


bingoGame.calledNumbers.push(
    number
);


bingoGame.currentNumber =
    number;


renderCurrentNumber();

renderCalledNumbers();

updateCalledHighlights();


/*
 * AUTO DAUB
 */

if (
    bingoGame.autoDaub
) {

    autoDaubCalledNumbers();

}


updateCallButtons();


if (
    !bingoGame.gameOver
) {

    showBingoResult(
        `${getBingoLetter(number)}${number} called!`
    );

}


return number;
 

}

/* =========================================================
31. CURRENT NUMBER
========================================================= */

function renderCurrentNumber() {

 
if (
    bingoGame.currentNumber === null
) {

    if (
        bingoElements.currentLetter
    ) {
        bingoElements.currentLetter.textContent =
            "READY";
    }

    if (
        bingoElements.currentNumber
    ) {
        bingoElements.currentNumber.textContent =
            "—";
    }

    return;

}


const number =
    bingoGame.currentNumber;


if (
    bingoElements.currentLetter
) {

    bingoElements.currentLetter.textContent =
        getBingoLetter(number);

}


if (
    bingoElements.currentNumber
) {

    bingoElements.currentNumber.textContent =
        number;

}
 

}

/* =========================================================
32. CALLED NUMBERS
========================================================= */

function renderCalledNumbers() {

 
const container =
    bingoElements.calledNumbers;

if (!container) {
    return;
}


container.innerHTML = "";


if (
    bingoGame.calledNumbers.length === 0
) {

    const empty =
        document.createElement(
            "span"
        );

    empty.className =
        "bingo-no-numbers";

    empty.textContent =
        "No numbers called yet.";

    container.appendChild(
        empty
    );

}

else {

    [
        ...bingoGame.calledNumbers
    ]
    .reverse()
    .forEach(
        number => {

            const item =
                document.createElement(
                    "span"
                );

            item.className =
                "bingo-called-number";

            item.dataset.number =
                number;

            item.textContent =
                `${getBingoLetter(number)}${number}`;

            container.appendChild(
                item
            );

        }
    );

}


if (
    bingoElements.calledTotal
) {

    bingoElements.calledTotal.textContent =
        bingoGame.calledNumbers.length;

}


if (
    bingoElements.calledCount
) {

    bingoElements.calledCount.textContent =
        bingoGame.calledNumbers.length;

}


if (
    bingoElements.remainingCount
) {

    bingoElements.remainingCount.textContent =
        bingoConfig.totalNumbers -
        bingoGame.calledNumbers.length;

}
 

}

/* =========================================================
33. CALLED HIGHLIGHTS
========================================================= */

function updateCalledHighlights() {

 
document
    .querySelectorAll(
        ".bingo-cell[data-number]"
    )
    .forEach(
        cell => {

            const value =
                cell.dataset.number;


            if (
                value === "FREE"
            ) {
                return;
            }


            const number =
                Number(value);


            cell.classList.toggle(
                "called",
                bingoGame.calledNumbers.includes(
                    number
                )
            );

        }
    );
 

}

/* =========================================================
34. START GAME
========================================================= */

function startBingoGame() {

 
if (
    bingoGame.gameOver
) {
    return false;
}


if (
    bingoGame.playing
) {
    return true;
}


const price =
    getBingoPrice();


const balance =
    bingoCredits.getBalance();


if (
    balance < price
) {

    showBingoResult(
        `💳 You need ${price} credits to play. You have ${balance}.`
    );

    return false;

}


if (
    !bingoCredits.spend(price)
) {

    showBingoResult(
        "💳 Not enough credits to start Bingo."
    );

    return false;

}


bingoGame.creditsPaid =
    price;

bingoGame.playing =
    true;

bingoGame.gameOver =
    false;


/*
 * First number is called immediately.
 */

showBingoResult(
    `🎱 Game started! ${price} credits used. Good luck!`
);


updateBingoCreditDisplay();

updateCallButtons();

updatePowerUpUI();


drawBingoNumber();


return true;
 

}

/* =========================================================
35. MANUAL CALL
========================================================= */

function manualBingoCall() {

 
if (
    bingoGame.autoCalling
) {
    return;
}


if (
    !bingoGame.playing
) {

    startBingoGame();

    return;

}


drawBingoNumber();
 

}

/* =========================================================
36. AUTO CALL
========================================================= */

function startBingoAutoCall() {

 
if (
    bingoGame.gameOver
) {
    return;
}


if (
    !bingoGame.playing
) {

    if (
        !startBingoGame()
    ) {
        return;
    }

}


if (
    bingoGame.autoCalling
) {
    return;
}


bingoGame.autoCalling =
    true;


bingoGame.autoTimer =
    setInterval(
        () => {

            if (
                !bingoGame.playing ||
                bingoGame.gameOver
            ) {

                stopBingoAutoCall();

                return;

            }


            drawBingoNumber();

        },
        bingoConfig.drawInterval
    );


updateCallButtons();


showBingoResult(
    "↻ Auto Call is running. Good luck! 🎱"
);
 

}

function stopBingoAutoCall() {

 
if (
    bingoGame.autoTimer
) {

    clearInterval(
        bingoGame.autoTimer
    );

}


bingoGame.autoTimer =
    null;


bingoGame.autoCalling =
    false;


updateCallButtons();
 

}

function toggleBingoAutoCall() {

 
if (
    bingoGame.autoCalling
) {

    stopBingoAutoCall();

    showBingoResult(
        "Auto Call stopped."
    );

    return;

}


startBingoAutoCall();
 

}

/* =========================================================
37. CALL BUTTON UI
========================================================= */

function updateCallButtons() {

 
if (
    bingoElements.callNumber
) {

    bingoElements.callNumber.disabled =
        bingoGame.gameOver ||
        bingoGame.autoCalling;

}


if (
    bingoElements.autoCall
) {

    bingoElements.autoCall.disabled =
        bingoGame.gameOver;


    bingoElements.autoCall.setAttribute(
        "aria-pressed",
        bingoGame.autoCalling
            ? "true"
            : "false"
    );


    const spans =
        bingoElements.autoCall.querySelectorAll(
            "span"
        );


    if (
        spans.length >= 2
    ) {

        spans[1].textContent =
            bingoGame.autoCalling
                ? "STOP AUTO CALL"
                : "AUTO CALL";

    }

}


if (
    bingoElements.newGame
) {

    bingoElements.newGame.disabled =
        false;

}
 

}

/* =========================================================
38. RESULT
========================================================= */

function showBingoResult(
message
) {

 
if (
    bingoElements.result
) {

    bingoElements.result.textContent =
        message;

}
 

}

/* =========================================================
39. NEW GAME
========================================================= */

function newBingoGame() {

 
stopBingoAutoCall();


if (
    bingoGame.powerUpCooldownTimer
) {

    clearInterval(
        bingoGame.powerUpCooldownTimer
    );

}


if (
    bingoGame.numberBoostTimer
) {

    clearTimeout(
        bingoGame.numberBoostTimer
    );

}


bingoGame.powerUpCooldownTimer =
    null;

bingoGame.numberBoostTimer =
    null;

bingoGame.powerUpCooldown =
    false;

bingoGame.powerUpCooldownRemaining =
    0;

bingoGame.availablePowerUp =
    null;

bingoGame.doubleDaubActive =
    false;

bingoGame.daubXP =
    0;

bingoGame.playing =
    false;

bingoGame.gameOver =
    false;

bingoGame.boards =
    [];

bingoGame.calledNumbers =
    [];

bingoGame.currentNumber =
    null;

bingoGame.winningCard =
    null;

bingoGame.creditsPaid =
    0;


if (
    bingoElements.win
) {

    bingoElements.win.hidden =
        true;

}


createBingoBoards();

renderBingoBoards();

renderCurrentNumber();

renderCalledNumbers();

updateCardSelectionUI();

updatePowerUpUI();

updateCallButtons();


showBingoResult(
    `${bingoGame.cards} ${
        bingoGame.cards === 1
            ? "card"
            : "cards"
    } ready — ${
        getBingoPrice()
    } credits to play.`
);
 

}

/* =========================================================
40. PLAY AGAIN
========================================================= */

function playBingoAgain() {

 
newBingoGame();

startBingoGame();
 

}

/* =========================================================
41. EVENTS
========================================================= */

function setupBingoEvents() {

 
/*
 * CARD OPTIONS
 */

bingoElements.cardOptions.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                selectBingoCardCount(
                    button.dataset.cardCount
                );

            }
        );

    }
);


/*
 * DAUB OPTIONS
 */

bingoElements.daubOptions.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                setBingoDaubMode(
                    button.dataset.daubMode
                );

            }
        );

    }
);


/*
 * CALL
 */

if (
    bingoElements.callNumber
) {

    bingoElements.callNumber.addEventListener(
        "click",
        manualBingoCall
    );

}


/*
 * AUTO CALL
 */

if (
    bingoElements.autoCall
) {

    bingoElements.autoCall.addEventListener(
        "click",
        toggleBingoAutoCall
    );

}


/*
 * NEW GAME
 */

if (
    bingoElements.newGame
) {

    bingoElements.newGame.addEventListener(
        "click",
        newBingoGame
    );

}


/*
 * PLAY AGAIN
 */

if (
    bingoElements.playAgain
) {

    bingoElements.playAgain.addEventListener(
        "click",
        playBingoAgain
    );

}


/*
 * POWER-UPS
 */

bingoElements.powerUpButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                const type =
                    button.dataset.powerup;


                if (
                    type === "lucky-daub"
                ) {

                    useLuckyDaub();

                }

                else if (
                    type === "number-boost"
                ) {

                    useNumberBoost();

                }

                else if (
                    type === "double-daub"
                ) {

                    useDoubleDaub();

                }

            }
        );

    }
);


/*
 * CREDIT UPDATE
 */

if (
    !window.bingoCreditListenerBound
) {

    window.bingoCreditListenerBound =
        true;


    window.addEventListener(
        "cafeCreditsChanged",
        updateBingoCreditDisplay
    );

}
 

}

/* =========================================================
42. INIT
========================================================= */

function initBingo() {

 
const room =
    document.getElementById(
        "bingoGame"
    );


if (!room) {

    console.warn(
        "🎱 Bingo room not found."
    );

    return false;

}


if (
    bingoGame.initialized
) {

    updateBingoCreditDisplay();

    updatePowerUpUI();

    return true;

}


console.log(
    "🎱 Initializing DigiCafe Bingo..."
);


if (
    !setupBingoElements()
) {

    console.error(
        "🎱 Bingo elements could not be initialized."
    );

    return false;

}


bingoGame.cards =
    bingoConfig.defaultCards;


setupBingoEvents();

newBingoGame();


bingoGame.initialized =
    true;


updateBingoCreditDisplay();

updatePowerUpUI();


console.log(
    "🎱 DigiCafe Bingo ready."
);


return true;
 

}

/* =========================================================
43. RESET
========================================================= */

function resetBingoInitialization() {

 
stopBingoAutoCall();


if (
    bingoGame.powerUpCooldownTimer
) {

    clearInterval(
        bingoGame.powerUpCooldownTimer
    );

}


if (
    bingoGame.numberBoostTimer
) {

    clearTimeout(
        bingoGame.numberBoostTimer
    );

}


bingoGame.initialized =
    false;

bingoGame.playing =
    false;

bingoGame.gameOver =
    false;

bingoGame.autoCalling =
    false;

bingoGame.boards =
    [];

bingoGame.calledNumbers =
    [];

bingoGame.currentNumber =
    null;

bingoGame.winningCard =
    null;

bingoGame.creditsPaid =
    0;

bingoGame.daubXP =
    0;

bingoGame.availablePowerUp =
    null;

bingoGame.powerUpCooldown =
    false;

bingoGame.powerUpCooldownRemaining =
    0;

bingoGame.powerUpCooldownTimer =
    null;

bingoGame.doubleDaubActive =
    false;

bingoGame.numberBoostTimer =
    null;
 

}

/* =========================================================
44. GLOBAL ACCESS
========================================================= */

window.bingoGame =
bingoGame;

window.bingoCredits =
bingoCredits;

window.initBingo =
initBingo;

window.newBingoGame =
newBingoGame;

window.startBingoGame =
startBingoGame;

window.manualBingoCall =
manualBingoCall;

window.toggleBingoAutoCall =
toggleBingoAutoCall;

window.startBingoAutoCall =
startBingoAutoCall;

window.stopBingoAutoCall =
stopBingoAutoCall;

window.playBingoAgain =
playBingoAgain;

window.selectBingoCardCount =
selectBingoCardCount;

window.toggleBingoAutoDaub =
toggleBingoAutoDaub;

window.useLuckyDaub =
useLuckyDaub;

window.useNumberBoost =
useNumberBoost;

window.useDoubleDaub =
useDoubleDaub;

window.addDaubXP =
addDaubXP;

window.updatePowerUpUI =
updatePowerUpUI;

window.resetBingoInitialization =
resetBingoInitialization;

console.log(
"🎱 DigiCafe Bingo complete engine loaded."
);
