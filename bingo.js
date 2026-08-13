/* =========================================================
   DIGICAFE BINGO
   ---------------------------------------------------------
   COMPLETE PLAYABLE BINGO ENGINE

   FEATURES
   ---------------------------------------------------------
   • 1, 2, 3 or 4 Bingo cards
   • Credit cost per card
   • Shared café credit system
   • Manual number calling
   • Automatic number calling
   • Stop / resume auto calling
   • Click called numbers to mark cards
   • Free center space
   • Called number history
   • B / I / N / G / O detection
   • Bingo detection
   • New Game
   • Play Again
   • Responsive card layout
   • Playroom compatible
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

    columns: 5

};


/* =========================================================
   02. GAME STATE
========================================================= */

const bingoGame = {

    initialized: false,

    playing: false,

    autoCalling: false,

    gameOver: false,

    autoTimer: null,

    cards: 1,

    boards: [],

    calledNumbers: [],

    currentNumber: null,

    winningCard: null,

    creditsPaid: 0

};


/* =========================================================
   03. BINGO ELEMENTS
========================================================= */

let bingoElements = {};


/* =========================================================
   04. CREDIT ADAPTER
   ---------------------------------------------------------
   Bingo tries to use the same credit balance as Café Slots.

   It checks several common DigiCafe balance locations.

   If your Slots uses another variable/key, this is the
   ONLY section that should need adjustment.
========================================================= */

const bingoCredits = {

    storageKeys: [
        "cafeCredits",
        "digiCafeCredits",
        "digicafeCredits",
        "slotCredits"
    ],


    getBalance() {

        /*
         * Existing Café Slots object
         */

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


        /*
         * Common global balances
         */

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


        /*
         * LocalStorage fallback
         */

        for (
            const key of this.storageKeys
        ) {

            const stored =
                localStorage.getItem(key);


            if (
                stored !== null &&
                !isNaN(Number(stored))
            ) {

                return Number(stored);

            }

        }


        /*
         * If no balance exists yet,
         * create one.
         */

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


        /*
         * Existing Café Slots object
         */

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


        /*
         * Global balances
         */

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


        /*
         * Always maintain a local fallback.
         */

        localStorage.setItem(
            "cafeCredits",
            String(amount)
        );


        /*
         * Let other DigiCafe systems know
         * that the balance changed.
         */

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


    canAfford(amount) {

        return (
            this.getBalance() >= amount
        );

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
   05. CREDIT DISPLAY HELPERS
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


    const price =
        getBingoPrice();


    /*
     * Optional elements.
     * These work if added to HTML later.
     */

    const balanceElements =
        document.querySelectorAll(
            "[data-bingo-credit-balance]"
        );


    balanceElements.forEach(
        element => {

            element.textContent =
                balance;

        }
    );


    const priceElements =
        document.querySelectorAll(
            "[data-bingo-price]"
        );


    priceElements.forEach(
        element => {

            element.textContent =
                price;

        }
    );


    const cardPriceElements =
        document.querySelectorAll(
            "[data-bingo-card-price]"
        );


    cardPriceElements.forEach(
        element => {

            element.textContent =
                bingoConfig.pricePerCard;

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
            )

    };


    if (
        !bingoElements.cards
    ) {

        console.error(
            '🎱 Bingo cards container missing. ' +
            'Expected id="bingoCards".'
        );

        return false;

    }


    return true;

}


/* =========================================================
   07. RANDOM NUMBER
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
   08. SHUFFLE
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
   09. GET BINGO LETTER
========================================================= */

function getBingoLetter(
    number
) {

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
   10. CREATE COLUMN
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
   11. CREATE CARD
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
   12. CREATE ALL BOARDS
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
   13. RENDER BOARDS
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


            const letters = [
                "B",
                "I",
                "N",
                "G",
                "O"
            ];


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
                                column
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


    updateCardCountLabel();

    updateBingoCreditDisplay();

}


/* =========================================================
   14. UPDATE CARD COUNT
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
   15. UPDATE CARD OPTIONS
========================================================= */

function updateCardSelectionUI() {

    if (
        !bingoElements.cardOptions
    ) {

        return;

    }


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


            /*
             * Add price to the option
             * if it has a price element.
             */

            const price =
                button.querySelector(
                    "[data-card-price]"
                );


            if (price) {

                price.textContent =
                    `${count * bingoConfig.pricePerCard} credits`;

            }

        }
    );


    updateBingoCreditDisplay();

}


/* =========================================================
   16. NORMALIZE CARD COUNT
========================================================= */

function normalizeCardCount(
    value
) {

    const number =
        Number(value);


    if (
        number <= 1
    ) {

        return 1;

    }


    if (
        number === 2
    ) {

        return 2;

    }


    if (
        number === 3
    ) {

        return 3;

    }


    return 4;

}


/* =========================================================
   17. SELECT CARD COUNT
========================================================= */

function selectBingoCardCount(
    count
) {

    const newCount =
        normalizeCardCount(
            count
        );


    if (
        bingoGame.playing
    ) {

        showBingoResult(
            "Start a new game before changing the number of cards."
        );

        return;

    }


    bingoGame.cards =
        newCount;


    updateCardSelectionUI();

    newBingoGame();

}


/* =========================================================
   18. MARK CELL
========================================================= */

function markBingoCell(
    cardIndex,
    row,
    column
) {

    if (
        !bingoGame.playing ||
        bingoGame.gameOver
    ) {

        return;

    }


    const card =
        bingoGame.boards[
            cardIndex
        ];


    if (!card) {

        return;

    }


    const number =
        card.numbers[row][column];


    if (
        number === "FREE"
    ) {

        return;

    }


    if (
        !bingoGame.calledNumbers.includes(
            number
        )
    ) {

        showBingoResult(
            `${getBingoLetter(number)}${number} has not been called yet.`
        );

        return;

    }


    card.marked[row][column] =
        !card.marked[row][column];


    updateBingoCellVisual(
        cardIndex,
        row,
        column
    );


    if (
        card.marked[row][column]
    ) {

        showBingoResult(
            `Marked ${getBingoLetter(number)}${number}.`
        );

    }


    checkBingo(
        cardIndex
    );

}


/* =========================================================
   19. UPDATE CELL VISUAL
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
   20. CHECK BINGO
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


    /*
     * ROWS
     */

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


    /*
     * COLUMNS
     */

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


    /*
     * DIAGONAL 1
     */

    let diagonalOne =
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

            break;

        }

    }


    if (diagonalOne) {

        winBingo(
            cardIndex,
            "diagonal"
        );

        return true;

    }


    /*
     * DIAGONAL 2
     */

    let diagonalTwo =
        true;


    for (
        let i = 0;
        i < 5;
        i++
    ) {

        if (
            !card.marked[i][4 - i]
        ) {

            diagonalTwo =
                false;

            break;

        }

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
   21. WIN
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

}


/* =========================================================
   22. DRAW NUMBER
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

    updateCallButtons();


    showBingoResult(
        `${getBingoLetter(number)}${number} called!`
    );


    return number;

}


/* =========================================================
   23. CURRENT NUMBER
========================================================= */

function renderCurrentNumber() {

    if (
        !bingoElements.currentNumber
    ) {

        return;

    }


    if (
        bingoGame.currentNumber === null
    ) {

        bingoElements.currentNumber.textContent =
            "—";


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


    const letter =
        getBingoLetter(
            number
        );


    if (
        bingoElements.currentLetter
    ) {

        bingoElements.currentLetter.textContent =
            letter;

    }


    bingoElements.currentNumber.textContent =
        number;

}


/* =========================================================
   24. CALLED NUMBERS
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
   25. HIGHLIGHT CALLED NUMBERS
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

            }
        );

}


/* =========================================================
   26. START GAME
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


    /*
     * CHECK CREDITS
     */

    if (
        balance < price
    ) {

        showBingoResult(
            `💳 You need ${price} credits to play ${bingoGame.cards} card${
                bingoGame.cards === 1
                    ? ""
                    : "s"
            }. You have ${balance}.`
        );


        updateCallButtons();


        return false;

    }


    /*
     * CHARGE THE PLAYER
     */

    if (
        !bingoCredits.spend(
            price
        )
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


    showBingoResult(
        `🎱 Game started! ${price} credits used. Good luck!`
    );


    updateCallButtons();

    updateBingoCreditDisplay();


    /*
     * Automatically call the first number.
     */

    drawBingoNumber();


    return true;

}


/* =========================================================
   27. MANUAL CALL
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

        if (
            !startBingoGame()
        ) {

            return;

        }


        /*
         * startBingoGame already called
         * the first number.
         */

        return;

    }


    drawBingoNumber();

}


/* =========================================================
   28. START AUTO CALL
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


        /*
         * First number was already called.
         */

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


/* =========================================================
   29. STOP AUTO CALL
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
   30. TOGGLE AUTO CALL
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
   31. UPDATE BUTTONS
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
   32. RESULT MESSAGE
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
   33. NEW GAME
   ---------------------------------------------------------
   This resets the board but DOES NOT charge credits.

   Credits are charged only when the player actually
   starts the game.
========================================================= */

function newBingoGame() {

    stopBingoAutoCall();


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
   34. PLAY AGAIN
========================================================= */

function playBingoAgain() {

    newBingoGame();


    startBingoGame();

}


/* =========================================================
   35. SETUP EVENTS
========================================================= */

function setupBingoEvents() {

    /*
     * CARD SELECTION
     */

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


    /*
     * CALL NUMBER
     */

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


    /*
     * AUTO CALL
     */

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


    /*
     * NEW GAME
     */

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


    /*
     * PLAY AGAIN
     */

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


    /*
     * LISTEN FOR CREDIT CHANGES
     */

    if (
        !window.bingoCreditListenerBound
    ) {

        window.bingoCreditListenerBound =
            true;


        window.addEventListener(
            "cafeCreditsChanged",
            () => {

                updateBingoCreditDisplay();

            }
        );

    }

}


/* =========================================================
   36. INITIALIZE
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


    /*
     * If already initialized,
     * simply refresh the display.
     */

    if (
        bingoGame.initialized
    ) {

        updateBingoCreditDisplay();

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


    console.log(
        `🎱 DigiCafe Bingo ready. ${bingoGame.cards} card selected.`
    );


    return true;

}


/* =========================================================
   37. CLEANUP
========================================================= */

function resetBingoInitialization() {

    stopBingoAutoCall();


    bingoGame.initialized =
        false;


    bingoGame.playing =
        false;


    bingoGame.autoCalling =
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

}


/* =========================================================
   38. GLOBAL ACCESS
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


window.resetBingoInitialization =
    resetBingoInitialization;


console.log(
    "🎱 DigiCafe Bingo engine loaded."
);
