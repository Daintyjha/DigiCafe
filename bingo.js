/* =========================================================
   DIGICAFE BINGO
   ---------------------------------------------------------
   COMPLETE BINGO ENGINE
   ---------------------------------------------------------

   FEATURES
   ---------------------------------------------------------
   • 1–4 Bingo cards
   • 10 credits per card
   • Shared café credits
   • Manual number calling
   • Automatic number calling
   • Manual Daub
   • Auto-Daub
   • Free center space
   • Called number history
   • Bingo detection
   • New Game
   • Play Again

   POWER-UP SYSTEM
   ---------------------------------------------------------
   • 3 successful daubs = 1 random power-up
   • ONLY ONE power-up is available per charge
   • Power-up must be used before another one can load
   • Coffee cup visually fills from 0 → 3
   • Lucky Daub
   • Number Boost
   • Double Daub
   • 5-second cooldown after use
   • No XP collected during cooldown
   • Auto-Daub also earns XP
========================================================= */


/* =========================================================
   01. CONFIGURATION
========================================================= */

const bingoConfig = {

    defaultCards: 1,

    minimumCards: 1,

    maximumCards: 4,

    pricePerCard: 10,

    drawInterval: 2200,

    totalNumbers: 75,

    rows: 5,

    columns: 5,

    xpPerPowerUp: 3,

    powerUpCooldown: 5

};


/* =========================================================
   02. GAME STATE
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


    /* -----------------------------------------------------
       DAUB MODE
    ----------------------------------------------------- */

    autoDaub: false,


    /* -----------------------------------------------------
       DOUBLE DAUB
       -----------------------------------------------------
       When active, the next successful normal daub
       counts as two XP instead of one.
    ----------------------------------------------------- */

    doubleDaubActive: false,


    /* -----------------------------------------------------
       POWER-UP XP
       ----------------------------------------------------- */

    daubXP: 0,


    /* -----------------------------------------------------
       RANDOM POWER-UP
       -----------------------------------------------------
       null = charging
       "lucky-daub"
       "number-boost"
       "double-daub"
    ----------------------------------------------------- */

    powerUpReady: false,

    activePowerUp: null,


    /* -----------------------------------------------------
       POWER-UP COOLDOWN
    ----------------------------------------------------- */

    powerUpCooldown: false,

    powerUpCooldownTimer: null,

    powerUpCooldownRemaining: 0,


    /* -----------------------------------------------------
       NUMBER BOOST
    ----------------------------------------------------- */

    numberBoostActive: false

};


/* =========================================================
   03. ELEMENT REFERENCES
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
                !isNaN(Number(value))
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

        amount =
            Math.max(
                0,
                Math.floor(
                    Number(amount) || 0
                )
            );


        if (
            window.cafeSlots &&
            typeof window.cafeSlots.balance === "number"
        ) {

            window.cafeSlots.balance =
                amount;

        }


        if (
            window.cafeSlots &&
            typeof window.cafeSlots.credits === "number"
        ) {

            window.cafeSlots.credits =
                amount;

        }


        if (
            typeof window.cafeCredits === "number"
        ) {

            window.cafeCredits =
                amount;

        }


        if (
            typeof window.digiCafeCredits === "number"
        ) {

            window.digiCafeCredits =
                amount;

        }


        if (
            typeof window.slotCredits === "number"
        ) {

            window.slotCredits =
                amount;

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
   05. PRICE
========================================================= */

function getBingoPrice() {

    return (
        bingoGame.cards *
        bingoConfig.pricePerCard
    );

}


/* =========================================================
   06. CREDIT DISPLAY
========================================================= */

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
            "[data-bingo-price]"
        )
        .forEach(
            element => {

                element.textContent =
                    getBingoPrice();

            }
        );


    document
        .querySelectorAll(
            "[data-card-price]"
        )
        .forEach(
            element => {

                const button =
                    element.closest(
                        "[data-card-count]"
                    );


                if (!button) {

                    return;

                }


                const count =
                    Number(
                        button.dataset.cardCount
                    );


                element.textContent =
                    `${count * bingoConfig.pricePerCard} credits`;

            }
        );

}


/* =========================================================
   07. ELEMENT SETUP
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


        /* -------------------------------------------------
           DAUB BUTTONS
        ------------------------------------------------- */

        daubOptions:
            document.querySelectorAll(
                ".bingo-daub-option"
            ),


        /* -------------------------------------------------
           POWER-UP
        ------------------------------------------------- */

        powerupMeter:
            document.querySelector(
                ".bingo-powerup-meter"
            ),

        powerupProgress:
            document.getElementById(
                "bingoPowerupProgress"
            ),

        powerupXP:
            document.getElementById(
                "bingoPowerupXP"
            ),

        powerupTimer:
            document.getElementById(
                "bingoPowerupTimer"
            ),

        powerupStatus:
            document.getElementById(
                "bingoPowerupStatus"
            ),

        powerupStatusTitle:
            document.getElementById(
                "bingoPowerupStatusTitle"
            ),

        powerupStatusText:
            document.getElementById(
                "bingoPowerupStatusText"
            ),

        powerupOptions:
            document.querySelectorAll(
                ".bingo-powerup-option"
            ),

        powerupCooldown:
            document.getElementById(
                "bingoPowerupCooldown"
            ),

        powerupCooldownTime:
            document.getElementById(
                "bingoPowerupCooldownTime"
            )

    };


    if (
        !bingoElements.room
    ) {

        return false;

    }


    if (
        !bingoElements.cards
    ) {

        console.error(
            "🎱 Bingo: #bingoCards is missing."
        );

        return false;

    }


    return true;

}


/* =========================================================
   08. RANDOM NUMBER
========================================================= */

function randomBingoNumber(
    min,
    max
) {

    return Math.floor(
        Math.random() *
        (
            max - min + 1
        )
    ) + min;

}


/* =========================================================
   09. SHUFFLE
========================================================= */

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
        ] =
        [
            result[j],
            result[i]
        ];

    }


    return result;

}


/* =========================================================
   10. BINGO LETTER
========================================================= */

function getBingoLetter(number) {

    if (
        number >= 1 &&
        number <= 15
    ) {

        return "B";

    }


    if (
        number >= 16 &&
        number <= 30
    ) {

        return "I";

    }


    if (
        number >= 31 &&
        number <= 45
    ) {

        return "N";

    }


    if (
        number >= 46 &&
        number <= 60
    ) {

        return "G";

    }


    if (
        number >= 61 &&
        number <= 75
    ) {

        return "O";

    }


    return "";

}


/* =========================================================
   11. CREATE COLUMN
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
    ] =
        ranges[column];


    const numbers = [];


    for (
        let number = min;
        number <= max;
        number++
    ) {

        numbers.push(
            number
        );

    }


    return shuffleBingoArray(
        numbers
    ).slice(
        0,
        5
    );

}


/* =========================================================
   12. CREATE CARD
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

        const numberRow = [];

        const markedRow = [];


        for (
            let column = 0;
            column < 5;
            column++
        ) {

            if (
                row === 2 &&
                column === 2
            ) {

                numberRow.push(
                    "FREE"
                );

                markedRow.push(
                    true
                );

            }

            else {

                numberRow.push(
                    columns[column][row]
                );

                markedRow.push(
                    false
                );

            }

        }


        card.numbers.push(
            numberRow
        );


        card.marked.push(
            markedRow
        );

    }


    return card;

}


/* =========================================================
   13. CREATE BOARDS
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
   14. RENDER BOARDS
========================================================= */

function renderBingoBoards() {

    const container =
        bingoElements.cards;


    if (!container) {

        console.error(
            "🎱 Bingo cards container missing."
        );

        return;

    }


    container.innerHTML = "";


    const letters = [
        "B",
        "I",
        "N",
        "G",
        "O"
    ];


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


            cardElement.appendChild(
                title
            );


            const grid =
                document.createElement(
                    "div"
                );


            grid.className =
                "bingo-grid";


            letters.forEach(
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
                            "free"
                        );

                        cell.classList.add(
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
                grid
            );


            container.appendChild(
                cardElement
            );

        }
    );


    highlightCalledNumberOnCards();

    updateCardCountLabel();

}


/* =========================================================
   15. CARD COUNT
========================================================= */

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


/* =========================================================
   16. CARD SELECTION UI
========================================================= */

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
   17. NORMALIZE CARD COUNT
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
            number || 1
        )
    );

}


/* =========================================================
   18. SELECT CARD COUNT
========================================================= */

function selectBingoCardCount(
    count
) {

    if (
        bingoGame.playing
    ) {

        showBingoResult(
            "Start a new game before changing the number of cards."
        );

        return;

    }


    bingoGame.cards =
        normalizeCardCount(
            count
        );


    updateCardSelectionUI();

    newBingoGame();

}


/* =========================================================
   19. DAUB MODE
========================================================= */

function setBingoDaubMode(
    mode
) {

    bingoGame.autoDaub =
        mode === "auto";


    bingoElements.daubOptions.forEach(
        button => {

            const active =
                button.dataset.daubMode ===
                mode;


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
            : "✋ Manual Daub ON — tap your called numbers yourself."
    );

}


/* =========================================================
   20. MARK CELL
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
        bingoGame.boards[
            cardIndex
        ];


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


    if (
        card.marked[row][column]
    ) {

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
     * Successful daub.
     */

    let xpAmount = 1;


    if (
        bingoGame.doubleDaubActive
    ) {

        xpAmount = 2;

        bingoGame.doubleDaubActive =
            false;

    }


    addDaubXP(
        xpAmount
    );


    if (
        source === "manual"
    ) {

        showBingoResult(
            `Marked ${getBingoLetter(number)}${number}. +${xpAmount} XP ⚡`
        );

    }


    checkBingo(
        cardIndex
    );


    return true;

}


/* =========================================================
   21. CELL VISUAL
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
        bingoGame.boards[
            cardIndex
        ];


    cell.classList.toggle(
        "marked",
        Boolean(
            card.marked[row][column]
        )
    );

}


/* =========================================================
   22. AUTO DAUB
========================================================= */

function autoDaubCalledNumbers() {

    if (
        !bingoGame.playing ||
        bingoGame.gameOver
    ) {

        return;

    }


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

                    markBingoCell(
                        cardIndex,
                        row,
                        column,
                        "auto"
                    );


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


/* =========================================================
   23. CHECK BINGO
========================================================= */

function checkBingo(
    cardIndex
) {

    const card =
        bingoGame.boards[
            cardIndex
        ];


    if (!card) {

        return false;

    }


    /* ROWS */

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


    /* COLUMNS */

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


    /* DIAGONAL */

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


    if (
        diagonalOne ||
        diagonalTwo
    ) {

        winBingo(
            cardIndex,
            "diagonal"
        );

        return true;

    }


    return false;

}


/* =========================================================
   24. ADD XP
========================================================= */

function addDaubXP(
    amount = 1
) {

    /*
     * No XP while cooldown is active.
     */

    if (
        bingoGame.powerUpCooldown
    ) {

        return;

    }


    if (
        !bingoGame.playing ||
        bingoGame.gameOver
    ) {

        return;

    }


    /*
     * If a power-up is already waiting,
     * XP must not continue accumulating.
     */

    if (
        bingoGame.powerUpReady
    ) {

        return;

    }


    bingoGame.daubXP =
        Math.min(
            bingoConfig.xpPerPowerUp,
            bingoGame.daubXP + amount
        );


    updatePowerUpUI();


    if (
        bingoGame.daubXP >=
        bingoConfig.xpPerPowerUp
    ) {

        chargeRandomPowerUp();

    }

}


/* =========================================================
   25. RANDOM POWER-UP
========================================================= */

function chargeRandomPowerUp() {

    if (
        bingoGame.powerUpReady
    ) {

        return;

    }


    const powerUps = [

        "lucky-daub",

        "number-boost",

        "double-daub"

    ];


    const randomIndex =
        Math.floor(
            Math.random() *
            powerUps.length
        );


    bingoGame.activePowerUp =
        powerUps[
            randomIndex
        ];


    bingoGame.powerUpReady =
        true;


    updatePowerUpUI();


    const names = {

        "lucky-daub":
            "🍀 Lucky Daub",

        "number-boost":
            "⚡ Number Boost",

        "double-daub":
            "✨ Double Daub"

    };


    showBingoResult(
        `🎉 ${names[bingoGame.activePowerUp]} is ready!`
    );

}


/* =========================================================
   26. POWER-UP UI
========================================================= */

function updatePowerUpUI() {

    const xp =
        bingoGame.daubXP;


    const maxXP =
        bingoConfig.xpPerPowerUp;


    const progress =
        (
            xp /
            maxXP
        ) * 100;


    /*
     * XP text
     */

    if (
        bingoElements.powerupXP
    ) {

        bingoElements.powerupXP.textContent =
            bingoGame.powerUpReady
                ? "FULL"
                : `${xp} / ${maxXP}`;

    }


    /*
     * Progress bar
     */

    if (
        bingoElements.powerupProgress
    ) {

        bingoElements.powerupProgress.style.width =
            `${progress}%`;

    }


    if (
        bingoElements.powerupMeter
    ) {

        bingoElements.powerupMeter.setAttribute(
            "aria-valuenow",
            xp
        );

    }


    /*
     * Timer
     */

    if (
        bingoElements.powerupTimer
    ) {

        if (
            bingoGame.powerUpCooldown
        ) {

            bingoElements.powerupTimer.textContent =
                `COOLDOWN ${bingoGame.powerUpCooldownRemaining}s`;

        }

        else if (
            bingoGame.powerUpReady
        ) {

            bingoElements.powerupTimer.textContent =
                "POWER-UP READY";

        }

        else {

            bingoElements.powerupTimer.textContent =
                "READY IN —";

        }

    }


    /*
     * Status
     */

    if (
        bingoElements.powerupStatusTitle &&
        bingoElements.powerupStatusText
    ) {

        if (
            bingoGame.powerUpCooldown
        ) {

            bingoElements.powerupStatusTitle.textContent =
                "Power-up cooldown";


            bingoElements.powerupStatusText.textContent =
                `Wait ${bingoGame.powerUpCooldownRemaining} seconds before charging again.`;

        }

        else if (
            bingoGame.powerUpReady
        ) {

            const names = {

                "lucky-daub":
                    "🍀 Lucky Daub",

                "number-boost":
                    "⚡ Number Boost",

                "double-daub":
                    "✨ Double Daub"

            };


            bingoElements.powerupStatusTitle.textContent =
                `${names[bingoGame.activePowerUp]} ready!`;


            bingoElements.powerupStatusText.textContent =
                "Use your power-up before charging the next one.";

        }

        else {

            bingoElements.powerupStatusTitle.textContent =
                "Power-up charging";


            bingoElements.powerupStatusText.textContent =
                `Daub ${maxXP - xp} more called number${
                    maxXP - xp === 1
                        ? ""
                        : "s"
                } to fill your coffee cup.`;

        }

    }


    updatePowerUpButtons();

}


/* =========================================================
   27. POWER-UP BUTTONS
========================================================= */

function updatePowerUpButtons() {

    bingoElements.powerupOptions.forEach(
        button => {

            const type =
                button.dataset.powerup;


            const isActive =
                bingoGame.powerUpReady &&
                bingoGame.activePowerUp === type;


            const available =
                isActive &&
                bingoGame.playing &&
                !bingoGame.gameOver &&
                !bingoGame.powerUpCooldown;


            button.disabled =
                !available;


            button.classList.toggle(
                "active",
                isActive
            );


            const status =
                button.querySelector(
                    "[data-powerup-ready]"
                );


            if (status) {

                if (
                    isActive
                ) {

                    status.textContent =
                        "READY";

                }

                else {

                    status.textContent =
                        bingoGame.powerUpReady
                            ? "LOCKED"
                            : "CHARGING";

                }

            }

        }
    );

}


/* =========================================================
   28. USE SELECTED POWER-UP
========================================================= */

function useBingoPowerUp(
    type
) {

    if (
        !bingoGame.playing ||
        bingoGame.gameOver
    ) {

        return;

    }


    if (
        bingoGame.powerUpCooldown
    ) {

        showBingoResult(
            `🧊 Power-up cooling down: ${bingoGame.powerUpCooldownRemaining}s`
        );

        return;

    }


    if (
        !bingoGame.powerUpReady
    ) {

        showBingoResult(
            "☕ Fill the coffee cup first."
        );

        return;

    }


    if (
        bingoGame.activePowerUp !== type
    ) {

        return;

    }


    let success =
        false;


    switch (type) {

        case "lucky-daub":

            success =
                useLuckyDaub();

            break;


        case "number-boost":

            success =
                useNumberBoost();

            break;


        case "double-daub":

            success =
                useDoubleDaub();

            break;

    }


    if (
        success
    ) {

        consumeLoadedPowerUp();

        startPowerUpCooldown();

    }

}


/* =========================================================
   29. CONSUME POWER-UP
========================================================= */

function consumeLoadedPowerUp() {

    bingoGame.powerUpReady =
        false;


    bingoGame.activePowerUp =
        null;


    bingoGame.daubXP =
        0;


    updatePowerUpUI();

}


/* =========================================================
   30. LUCKY DAUB
   ---------------------------------------------------------
   Marks ONE currently called number on ONE card.
========================================================= */

function useLuckyDaub() {

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
                    number !== "FREE" &&
                    bingoGame.calledNumbers.includes(
                        number
                    ) &&
                    !card.marked[row][column]
                ) {

                    card.marked[row][column] =
                        true;


                    updateBingoCellVisual(
                        cardIndex,
                        row,
                        column
                    );


                    checkBingo(
                        cardIndex
                    );


                    showBingoResult(
                        `🍀 Lucky Daub marked ${getBingoLetter(number)}${number}!`
                    );


                    return true;

                }

            }

        }

    }


    showBingoResult(
        "🍀 Lucky Daub could not find a new called number."
    );


    return false;

}


/* =========================================================
   31. NUMBER BOOST
   ---------------------------------------------------------
   Highlights all currently called numbers on cards.
========================================================= */

function useNumberBoost() {

    bingoGame.numberBoostActive =
        true;


    highlightCalledNumberOnCards();


    document
        .querySelectorAll(
            ".bingo-cell.called"
        )
        .forEach(
            cell => {

                cell.classList.add(
                    "number-boost"
                );

            }
        );


    showBingoResult(
        "⚡ Number Boost activated! Called numbers are highlighted."
    );


    setTimeout(
        () => {

            bingoGame.numberBoostActive =
                false;


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
        5000
    );


    return true;

}


/* =========================================================
   32. DOUBLE DAUB
========================================================= */

function useDoubleDaub() {

    bingoGame.doubleDaubActive =
        true;


    showBingoResult(
        "✨ Double Daub ready! Your next successful daub gives 2 XP."
    );


    return true;

}


/* =========================================================
   33. COOLDOWN
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


                    updatePowerUpUI();


                    showBingoResult(
                        "☕ Your coffee cup is ready to start filling again."
                    );

                }

            },
            1000
        );

}


/* =========================================================
   34. DRAW NUMBER
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

    }

    while (
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

    highlightCalledNumberOnCards();


    /*
     * AUTO-DAUB
     */

    if (
        bingoGame.autoDaub
    ) {

        autoDaubCalledNumbers();

    }


    updateGameStats();

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
   35. CURRENT NUMBER
========================================================= */

function renderCurrentNumber() {

    if (
        bingoGame.currentNumber === null
    ) {

        if (
            bingoElements.currentNumber
        ) {

            bingoElements.currentNumber.textContent =
                "—";

        }


        if (
            bingoElements.currentLetter
        ) {

            bingoElements.currentLetter.textContent =
                "READY";

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
   36. CALLED NUMBERS
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

}


/* =========================================================
   37. HIGHLIGHT CALLED NUMBERS
========================================================= */

function highlightCalledNumberOnCards() {

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


                cell.classList.toggle(
                    "number-boost",
                    bingoGame.numberBoostActive &&
                    bingoGame.calledNumbers.includes(
                        number
                    )
                );

            }
        );

}


/* =========================================================
   38. GAME STATS
========================================================= */

function updateGameStats() {

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
   39. START GAME
========================================================= */

function startBingoGame() {

    if (
        bingoGame.playing
    ) {

        return true;

    }


    if (
        bingoGame.gameOver
    ) {

        return false;

    }


    const price =
        getBingoPrice();


    const balance =
        bingoCredits.getBalance();


    if (
        balance < price
    ) {

        showBingoResult(
            `💳 You need ${price} credits. You have ${balance}.`
        );


        return false;

    }


    if (
        !bingoCredits.spend(
            price
        )
    ) {

        showBingoResult(
            "💳 Not enough café credits."
        );


        return false;

    }


    bingoGame.creditsPaid =
        price;


    bingoGame.playing =
        true;


    bingoGame.gameOver =
        false;


    updateBingoCreditDisplay();


    showBingoResult(
        `🎱 Game started! ${price} credits used. Good luck!`
    );


    updateCallButtons();


    /*
     * First number is called immediately.
     */

    drawBingoNumber();


    return true;

}


/* =========================================================
   40. MANUAL CALL
========================================================= */

function manualBingoCall() {

    if (
        bingoGame.gameOver
    ) {

        return;

    }


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
   41. AUTO CALL
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
        "↻ Auto Call is running."
    );

}


/* =========================================================
   42. STOP AUTO CALL
========================================================= */

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


/* =========================================================
   43. TOGGLE AUTO CALL
========================================================= */

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
   44. UPDATE CALL BUTTONS
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

}


/* =========================================================
   45. RESULT
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
   46. WIN
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


    stopBingoAutoCall();


    const cardElement =
        document.querySelector(
            `.bingo-card[data-card="${cardIndex}"]`
        );


    if (cardElement) {

        cardElement.classList.add(
            "bingo-winner"
        );

    }


    if (
        bingoElements.wins
    ) {

        const currentWins =
            Number(
                bingoElements.wins.textContent
            ) || 0;


        bingoElements.wins.textContent =
            currentWins + 1;

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


    if (
        bingoElements.win
    ) {

        bingoElements.win.hidden =
            false;

    }


    showBingoResult(
        `🎉 BINGO! Card ${cardIndex + 1} completed a ${pattern}!`
    );


    updateCallButtons();

    updatePowerUpUI();

}


/* =========================================================
   47. NEW GAME
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


    bingoGame.powerUpCooldownTimer =
        null;


    bingoGame.powerUpCooldown =
        false;


    bingoGame.powerUpCooldownRemaining =
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


    /*
     * Reset power-up.
     */

    bingoGame.daubXP =
        0;


    bingoGame.powerUpReady =
        false;


    bingoGame.activePowerUp =
        null;


    bingoGame.doubleDaubActive =
        false;


    bingoGame.numberBoostActive =
        false;


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

    updateGameStats();

    updateCardSelectionUI();

    updatePowerUpUI();

    updateCallButtons();


    showBingoResult(
        `${bingoGame.cards} ${
            bingoGame.cards === 1
                ? "card"
                : "cards"
        } ready — ${getBingoPrice()} credits to play.`
    );

}


/* =========================================================
   48. PLAY AGAIN
========================================================= */

function playBingoAgain() {

    newBingoGame();

    startBingoGame();

}


/* =========================================================
   49. EVENT SETUP
========================================================= */

function setupBingoEvents() {

    /* CARD SELECTION */

    bingoElements.cardOptions.forEach(
        button => {

            if (
                button.dataset.bingoBound ===
                "true"
            ) {

                return;

            }


            button.dataset.bingoBound =
                "true";


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


    /* DAUB MODE */

    bingoElements.daubOptions.forEach(
        button => {

            if (
                button.dataset.bingoBound ===
                "true"
            ) {

                return;

            }


            button.dataset.bingoBound =
                "true";


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


    /* CALL NUMBER */

    if (
        bingoElements.callNumber &&
        bingoElements.callNumber.dataset.bingoBound !==
        "true"
    ) {

        bingoElements.callNumber.dataset.bingoBound =
            "true";


        bingoElements.callNumber.addEventListener(
            "click",
            manualBingoCall
        );

    }


    /* AUTO CALL */

    if (
        bingoElements.autoCall &&
        bingoElements.autoCall.dataset.bingoBound !==
        "true"
    ) {

        bingoElements.autoCall.dataset.bingoBound =
            "true";


        bingoElements.autoCall.addEventListener(
            "click",
            toggleBingoAutoCall
        );

    }


    /* POWER-UPS */

    bingoElements.powerupOptions.forEach(
        button => {

            if (
                button.dataset.bingoBound ===
                "true"
            ) {

                return;

            }


            button.dataset.bingoBound =
                "true";


            button.addEventListener(
                "click",
                () => {

                    useBingoPowerUp(
                        button.dataset.powerup
                    );

                }
            );

        }
    );


    /* NEW GAME */

    if (
        bingoElements.newGame &&
        bingoElements.newGame.dataset.bingoBound !==
        "true"
    ) {

        bingoElements.newGame.dataset.bingoBound =
            "true";


        bingoElements.newGame.addEventListener(
            "click",
            newBingoGame
        );

    }


    /* PLAY AGAIN */

    if (
        bingoElements.playAgain &&
        bingoElements.playAgain.dataset.bingoBound !==
        "true"
    ) {

        bingoElements.playAgain.dataset.bingoBound =
            "true";


        bingoElements.playAgain.addEventListener(
            "click",
            playBingoAgain
        );

    }


    /* CREDIT UPDATE */

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
   50. INITIALIZE
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

        /*
         * IMPORTANT:
         * Re-render cards if another component
         * has cleared the Bingo room.
         */

        if (
            bingoElements.cards &&
            bingoElements.cards.children.length === 0 &&
            bingoGame.boards.length > 0
        ) {

            renderBingoBoards();

        }


        updateBingoCreditDisplay();

        updatePowerUpUI();

        updateCallButtons();

        return true;

    }


    console.log(
        "🎱 Initializing DigiCafe Bingo..."
    );


    if (
        !setupBingoElements()
    ) {

        return false;

    }


    bingoGame.cards =
        normalizeCardCount(
            bingoConfig.defaultCards
        );


    setupBingoEvents();

    newBingoGame();


    bingoGame.initialized =
        true;


    updateBingoCreditDisplay();

    updatePowerUpUI();

    updateCallButtons();


    console.log(
        "🎱 DigiCafe Bingo ready."
    );


    return true;

}


/* =========================================================
   51. RESET
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


    bingoGame.initialized =
        false;


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


    bingoGame.daubXP =
        0;


    bingoGame.powerUpReady =
        false;


    bingoGame.activePowerUp =
        null;


    bingoGame.powerUpCooldown =
        false;


    bingoGame.powerUpCooldownTimer =
        null;


    bingoGame.powerUpCooldownRemaining =
        0;


    bingoGame.doubleDaubActive =
        false;


    bingoGame.numberBoostActive =
        false;

}


/* =========================================================
   52. GLOBAL ACCESS
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

window.setBingoDaubMode =
    setBingoDaubMode;

window.useBingoPowerUp =
    useBingoPowerUp;

window.addDaubXP =
    addDaubXP;

window.updatePowerUpUI =
    updatePowerUpUI;

window.resetBingoInitialization =
    resetBingoInitialization;


console.log(
    "🎱 DigiCafe Bingo — complete engine loaded."
);
