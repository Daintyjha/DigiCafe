/* =========================================================
   DIGICAFE BINGO 2.0
   CORE GAME ENGINE
   =========================================================

   PHASE 1
   ---------------------------------------------------------
   • 75-ball Bingo
   • 1–4 cards
   • Card generation
   • Manual Daub
   • Auto-Daub
   • Number caller
   • Called-number history
   • Card selection
   • New Game
   • Play Again
   • Bingo detection
   • Win screen

   PHASE 2
   ---------------------------------------------------------
   • Coffee brewing
   • Power-ups
   • Single Daub
   • Double Daub
   • Triple Daub
   • Wild Daub
   • Treasure
   • Double Reward
   • Instant Charge
   • Instant Bingo
========================================================= */


/* =========================================================
   01. BINGO GAME STATE
========================================================= */

const bingo = {

    initialized: false,

    cardCount: 1,

    cards: [],

    calledNumbers: [],

    availableNumbers: [],

    currentNumber: null,

    currentLetter: null,

    wins: 0,

    daubMode: "manual",

    autoCall: false,

    autoCallTimer: null,

    autoCallInterval: 3000,

    gameStarted: false,

    gameOver: false

};


/* =========================================================
   02. DOM HELPER
========================================================= */

function getBingoElement(id) {

    return document.getElementById(id);

}


/* =========================================================
   03. CREATE NUMBER POOL
========================================================= */

function createBingoNumberPool() {

    return Array.from(
        { length: 75 },
        (_, index) => index + 1
    );

}


/* =========================================================
   04. SHUFFLE
========================================================= */

function shuffleBingoNumbers(numbers) {

    const shuffled = [...numbers];


    for (
        let i = shuffled.length - 1;
        i > 0;
        i--
    ) {

        const randomIndex =
            Math.floor(
                Math.random() * (i + 1)
            );


        [
            shuffled[i],
            shuffled[randomIndex]
        ] = [
            shuffled[randomIndex],
            shuffled[i]
        ];

    }


    return shuffled;

}


/* =========================================================
   05. BINGO LETTER
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
   06. GENERATE ONE BINGO CARD
========================================================= */

function generateBingoCard() {

    const ranges = [

        {
            min: 1,
            max: 15
        },

        {
            min: 16,
            max: 30
        },

        {
            min: 31,
            max: 45
        },

        {
            min: 46,
            max: 60
        },

        {
            min: 61,
            max: 75
        }

    ];


    /*
        Create the five columns.

        Each column receives five unique
        numbers from its correct range.
    */

    const columns =
        ranges.map(range => {

            const numbers =
                Array.from(
                    {
                        length:
                            range.max -
                            range.min +
                            1
                    },
                    (_, index) =>
                        range.min + index
                );


            return shuffleBingoNumbers(
                numbers
            ).slice(0, 5);

        });


    const card = [];


    /*
        Convert columns into rows.
    */

    for (
        let row = 0;
        row < 5;
        row++
    ) {

        const currentRow = [];


        for (
            let column = 0;
            column < 5;
            column++
        ) {

            /*
                FREE CENTER
            */

            if (
                row === 2 &&
                column === 2
            ) {

                currentRow.push({

                    number: null,

                    letter: "N",

                    marked: true,

                    free: true

                });


                continue;

            }


            const number =
                columns[column][row];


            currentRow.push({

                number: number,

                letter:
                    getBingoLetter(number),

                marked: false,

                free: false

            });

        }


        card.push(
            currentRow
        );

    }


    return card;

}


/* =========================================================
   07. GENERATE ALL CARDS
========================================================= */

function generateBingoCards() {

    bingo.cards = [];


    for (
        let index = 0;
        index < bingo.cardCount;
        index++
    ) {

        bingo.cards.push(
            generateBingoCard()
        );

    }

}


/* =========================================================
   08. RESET GAME
========================================================= */

function resetBingoGame() {

    stopBingoAutoCall();


    bingo.cards = [];


    bingo.calledNumbers = [];


    bingo.availableNumbers =
        shuffleBingoNumbers(
            createBingoNumberPool()
        );


    bingo.currentNumber =
        null;


    bingo.currentLetter =
        null;


    bingo.gameStarted =
        false;


    bingo.gameOver =
        false;


    hideBingoWin();

}


/* =========================================================
   09. START NEW GAME
========================================================= */

function startBingoGame() {

    const room =
        getBingoElement(
            "bingoGame"
        );


    if (!room) {

        console.warn(
            "🎱 Bingo room not found."
        );

        return false;

    }


    /*
        Reset round.
    */

    resetBingoGame();


    /*
        Create requested cards.
    */

    generateBingoCards();


    bingo.gameStarted =
        true;


    /*
        Update interface.
    */

    updateBingoCardCountLabel();

    updateBingoStats();

    updateBingoCaller();

    renderBingoCards();

    renderBingoCalledNumbers();


    showBingoMessage(
        "Your cards are ready. Call a number to begin!"
    );


    console.log(
        "🎱 DigiCafe Bingo started."
    );


    return true;

}


/* =========================================================
   10. UPDATE STATS
========================================================= */

function updateBingoStats() {

    const called =
        getBingoElement(
            "bingoCalledCount"
        );


    const remaining =
        getBingoElement(
            "bingoRemainingCount"
        );


    const wins =
        getBingoElement(
            "bingoWins"
        );


    const total =
        getBingoElement(
            "bingoCalledTotal"
        );


    if (called) {

        called.textContent =
            bingo.calledNumbers.length;

    }


    if (remaining) {

        remaining.textContent =
            bingo.availableNumbers.length;

    }


    if (wins) {

        wins.textContent =
            bingo.wins;

    }


    if (total) {

        total.textContent =
            bingo.calledNumbers.length;

    }

}


/* =========================================================
   11. CARD COUNT LABEL
========================================================= */

function updateBingoCardCountLabel() {

    const label =
        getBingoElement(
            "bingoCardCountLabel"
        );


    if (!label) {

        return;

    }


    label.textContent =
        bingo.cardCount === 1

            ? "1 CARD"

            : `${bingo.cardCount} CARDS`;

}


/* =========================================================
   12. CARD SELECTION
========================================================= */

function setupBingoCardSelection() {

    const options =
        document.querySelectorAll(
            "[data-card-count]"
        );


    options.forEach(
        option => {

            if (
                option.dataset.bingoBound ===
                "true"
            ) {

                return;

            }


            option.dataset.bingoBound =
                "true";


            option.addEventListener(
                "click",
                () => {

                    const count =
                        Number(
                            option.dataset.cardCount
                        );


                    if (
                        !Number.isInteger(
                            count
                        )
                    ) {

                        return;

                    }


                    if (
                        count < 1 ||
                        count > 4
                    ) {

                        return;

                    }


                    /*
                        Change selected card count.
                    */

                    bingo.cardCount =
                        count;


                    /*
                        Update active button.
                    */

                    options.forEach(
                        item => {

                            const active =
                                Number(
                                    item.dataset.cardCount
                                ) === count;


                            item.classList.toggle(
                                "active",
                                active
                            );


                            item.setAttribute(
                                "aria-pressed",
                                String(active)
                            );

                        }
                    );


                    /*
                        If the round has not started
                        calling numbers, immediately
                        generate the selected cards.
                    */

                    if (
                        bingo.calledNumbers.length === 0
                    ) {

                        generateBingoCards();

                        renderBingoCards();

                    }


                    updateBingoCardCountLabel();


                    showBingoMessage(

                        `${count} ${
                            count === 1
                                ? "card"
                                : "cards"
                        } selected.`

                    );

                }
            );

        }
    );

}


/* =========================================================
   13. DAUB MODE
========================================================= */

function setupBingoDaubModes() {

    const options =
        document.querySelectorAll(
            "[data-daub-mode]"
        );


    options.forEach(
        option => {

            if (
                option.dataset.bingoBound ===
                "true"
            ) {

                return;

            }


            option.dataset.bingoBound =
                "true";


            option.addEventListener(
                "click",
                () => {

                    const mode =
                        option.dataset.daubMode;


                    if (
                        mode !== "manual" &&
                        mode !== "auto"
                    ) {

                        return;

                    }


                    bingo.daubMode =
                        mode;


                    options.forEach(
                        item => {

                            const active =
                                item.dataset.daubMode ===
                                mode;


                            item.classList.toggle(
                                "active",
                                active
                            );


                            item.setAttribute(
                                "aria-pressed",
                                String(active)
                            );

                        }
                    );


                    showBingoMessage(

                        mode === "manual"

                            ? "Manual Daub enabled."

                            : "Auto-Daub enabled."

                    );


                    /*
                        If Auto-Daub is selected
                        after numbers have already
                        been called, catch up the cards.
                    */

                    if (
                        mode === "auto"
                    ) {

                        autoDaubAllCards();

                        checkBingoWin();

                    }

                }
            );

        }
    );

}


/* =========================================================
   14. CALL NUMBER
========================================================= */

function callBingoNumber() {

    if (
        bingo.gameOver
    ) {

        return null;

    }


    if (
        bingo.availableNumbers.length === 0
    ) {

        stopBingoAutoCall();


        showBingoMessage(
            "All 75 numbers have been called."
        );


        return null;

    }


    bingo.gameStarted =
        true;


    /*
        Take one random number
        from the remaining pool.
    */

    const number =
        bingo.availableNumbers.pop();


    bingo.currentNumber =
        number;


    bingo.currentLetter =
        getBingoLetter(number);


    bingo.calledNumbers.push(
        number
    );


    /*
        Update caller.
    */

    updateBingoCaller();


    /*
        Update statistics.
    */

    updateBingoStats();


    /*
        Update called-number history.
    */

    renderBingoCalledNumbers();


    /*
        Auto-Daub mode.
    */

    if (
        bingo.daubMode === "auto"
    ) {

        autoDaubAllCards();

    }


    /*
        Check for Bingo.
    */

    checkBingoWin();


    /*
        User feedback.
    */

    showBingoMessage(
        `${bingo.currentLetter} ${number} called!`
    );


    return number;

}


/* =========================================================
   15. UPDATE CURRENT CALLER
========================================================= */

function updateBingoCaller() {

    const letter =
        getBingoElement(
            "bingoCurrentLetter"
        );


    const number =
        getBingoElement(
            "bingoCurrentNumber"
        );


    if (letter) {

        letter.textContent =
            bingo.currentLetter ||
            "READY";

    }


    if (number) {

        number.textContent =
            bingo.currentNumber ??
            "—";

    }

}


/* =========================================================
   16. CHECK IF NUMBER WAS CALLED
========================================================= */

function isBingoNumberCalled(number) {

    if (
        number === null ||
        number === undefined
    ) {

        return false;

    }


    return bingo.calledNumbers.includes(
        number
    );

}


/* =========================================================
   17. DAUB ONE CELL
========================================================= */

function daubBingoCell(
    cardIndex,
    rowIndex,
    columnIndex
) {

    if (
        bingo.gameOver
    ) {

        return false;

    }


    const card =
        bingo.cards[
            cardIndex
        ];


    if (!card) {

        return false;

    }


    const cell =
        card[
            rowIndex
        ]?.[
            columnIndex
        ];


    if (!cell) {

        return false;

    }


    /*
        FREE space is already marked.
    */

    if (
        cell.free
    ) {

        return false;

    }


    /*
        Prevent double marking.
    */

    if (
        cell.marked
    ) {

        return false;

    }


    /*
        Only called numbers may
        be manually daubed.
    */

    if (
        !isBingoNumberCalled(
            cell.number
        )
    ) {

        showBingoMessage(
            `${cell.number} has not been called yet.`
        );


        return false;

    }


    /*
        MARK CELL
    */

    cell.marked =
        true;


    renderBingoCards();


    /*
        Check Bingo immediately.
    */

    checkBingoWin();


    /*
        Coffee will be connected
        in Phase 2.
    */

    showBingoMessage(
        `${cell.letter} ${cell.number} daubed! ☕`
    );


    return true;

}


/* =========================================================
   18. AUTO DAUB
========================================================= */

function autoDaubAllCards() {

    let markedAny =
        false;


    bingo.cards.forEach(
        card => {

            card.forEach(
                row => {

                    row.forEach(
                        cell => {

                            if (
                                cell.free
                            ) {

                                return;

                            }


                            if (
                                cell.marked
                            ) {

                                return;

                            }


                            if (
                                isBingoNumberCalled(
                                    cell.number
                                )
                            ) {

                                cell.marked =
                                    true;

                                markedAny =
                                    true;

                            }

                        }
                    );

                }
            );

        }
    );


    if (
        markedAny
    ) {

        renderBingoCards();

    }


    return markedAny;

}


/* =========================================================
   19. RENDER BINGO CARDS
========================================================= */

function renderBingoCards() {

    const container =
        getBingoElement(
            "bingoCards"
        );


    if (!container) {

        console.warn(
            "🎱 #bingoCards not found."
        );

        return;

    }


    container.innerHTML =
        "";


    bingo.cards.forEach(
        (
            card,
            cardIndex
        ) => {

            const wrapper =
                document.createElement(
                    "article"
                );


            wrapper.className =
                "bingo-card";


            wrapper.dataset.cardIndex =
                cardIndex;


            /*
                Card title.
            */

            const title =
                document.createElement(
                    "div"
                );


            title.className =
                "bingo-card-title";


            title.textContent =
                `CARD ${cardIndex + 1}`;


            wrapper.appendChild(
                title
            );


            /*
                Bingo grid.
            */

            const grid =
                document.createElement(
                    "div"
                );


            grid.className =
                "bingo-grid";


            /*
                BINGO HEADER
            */

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
                        "bingo-grid-header";


                    header.textContent =
                        letter;


                    grid.appendChild(
                        header
                    );

                }
            );


            /*
                CARD CELLS
            */

            card.forEach(
                (
                    row,
                    rowIndex
                ) => {

                    row.forEach(
                        (
                            cell,
                            columnIndex
                        ) => {

                            const button =
                                document.createElement(
                                    "button"
                                );


                            button.type =
                                "button";


                            button.className =
                                "bingo-cell";


                            button.dataset.cardIndex =
                                cardIndex;


                            button.dataset.row =
                                rowIndex;


                            button.dataset.column =
                                columnIndex;


                            /*
                                FREE SPACE
                            */

                            if (
                                cell.free
                            ) {

                                button.classList.add(
                                    "free"
                                );


                                button.textContent =
                                    "☕";

                            }

                            else {

                                button.textContent =
                                    cell.number;

                            }


                            /*
                                Called number.
                            */

                            if (
                                isBingoNumberCalled(
                                    cell.number
                                )
                            ) {

                                button.classList.add(
                                    "called"
                                );

                            }


                            /*
                                Marked number.
                            */

                            if (
                                cell.marked
                            ) {

                                button.classList.add(
                                    "marked"
                                );

                            }


                            /*
                                Number is ready
                                for manual daub.
                            */

                            if (
                                bingo.daubMode ===
                                    "manual" &&

                                !cell.free &&

                                !cell.marked &&

                                isBingoNumberCalled(
                                    cell.number
                                )
                            ) {

                                button.classList.add(
                                    "daubable"
                                );

                            }


                            /*
                                Cell interaction.
                            */

                            button.addEventListener(
                                "click",
                                () => {

                                    daubBingoCell(
                                        cardIndex,
                                        rowIndex,
                                        columnIndex
                                    );

                                }
                            );


                            grid.appendChild(
                                button
                            );

                        }
                    );

                }
            );


            wrapper.appendChild(
                grid
            );


            container.appendChild(
                wrapper
            );

        }
    );


    updateBingoCardCountLabel();

}


/* =========================================================
   20. RENDER CALLED NUMBERS
========================================================= */

function renderBingoCalledNumbers() {

    const container =
        getBingoElement(
            "bingoCalledNumbers"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    /*
        Nothing called yet.
    */

    if (
        bingo.calledNumbers.length === 0
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


        return;

    }


    /*
        Sort numbers by value.
    */

    const sorted =
        [...bingo.calledNumbers]
            .sort(
                (a, b) => a - b
            );


    sorted.forEach(
        number => {

            const item =
                document.createElement(
                    "span"
                );


            item.className =
                "bingo-called-number";


            item.textContent =
                `${getBingoLetter(number)} ${number}`;


            /*
                Highlight most recently
                called number.
            */

            if (
                number ===
                bingo.currentNumber
            ) {

                item.classList.add(
                    "current"
                );

            }


            container.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   21. CHECK BINGO
========================================================= */

function checkBingoWin() {

    if (
        bingo.gameOver
    ) {

        return false;

    }


    for (
        let cardIndex = 0;
        cardIndex <
        bingo.cards.length;
        cardIndex++
    ) {

        const card =
            bingo.cards[
                cardIndex
            ];


        if (
            isWinningBingoCard(
                card
            )
        ) {

            bingo.gameOver =
                true;


            bingo.wins++;


            stopBingoAutoCall();


            updateBingoStats();


            showBingoWin(
                cardIndex
            );


            return true;

        }

    }


    return false;

}


/* =========================================================
   22. CHECK ONE CARD
========================================================= */

function isWinningBingoCard(card) {

    if (!card) {

        return false;

    }


    /*
        ROWS
    */

    for (
        let row = 0;
        row < 5;
        row++
    ) {

        const complete =
            card[row].every(
                cell =>
                    cell.marked ||
                    cell.free
            );


        if (
            complete
        ) {

            return true;

        }

    }


    /*
        COLUMNS
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

            const cell =
                card[row][column];


            if (
                !cell.marked &&
                !cell.free
            ) {

                complete =
                    false;

                break;

            }

        }


        if (
            complete
        ) {

            return true;

        }

    }


    /*
        DIAGONAL \
    */

    let diagonalOne =
        true;


    for (
        let index = 0;
        index < 5;
        index++
    ) {

        const cell =
            card[index][index];


        if (
            !cell.marked &&
            !cell.free
        ) {

            diagonalOne =
                false;

            break;

        }

    }


    if (
        diagonalOne
    ) {

        return true;

    }


    /*
        DIAGONAL /
    */

    let diagonalTwo =
        true;


    for (
        let index = 0;
        index < 5;
        index++
    ) {

        const cell =
            card[index][4 - index];


        if (
            !cell.marked &&
            !cell.free
        ) {

            diagonalTwo =
                false;

            break;

        }

    }


    return diagonalTwo;

}


/* =========================================================
   23. SHOW WIN SCREEN
========================================================= */

function showBingoWin(cardIndex) {

    const win =
        getBingoElement(
            "bingoWin"
        );


    if (!win) {

        return;

    }


    const finalCards =
        getBingoElement(
            "bingoFinalCards"
        );


    const finalCalled =
        getBingoElement(
            "bingoFinalCalled"
        );


    const message =
        getBingoElement(
            "bingoWinMessage"
        );


    if (finalCards) {

        finalCards.textContent =
            bingo.cardCount;

    }


    if (finalCalled) {

        finalCalled.textContent =
            bingo.calledNumbers.length;

    }


    if (message) {

        message.textContent =
            `BINGO! Card ${
                cardIndex + 1
            } completed a line. Nicely played, besh. ☕`;

    }


    win.hidden =
        false;


    win.style.display =
        "flex";

}


/* =========================================================
   24. HIDE WIN SCREEN
========================================================= */

function hideBingoWin() {

    const win =
        getBingoElement(
            "bingoWin"
        );


    if (!win) {

        return;

    }


    win.hidden =
        true;


    win.style.display =
        "";

}


/* =========================================================
   25. MESSAGE
========================================================= */

function showBingoMessage(message) {

    const result =
        getBingoElement(
            "bingoResult"
        );


    if (!result) {

        return;

    }


    result.textContent =
        message;

}


/* =========================================================
   26. AUTO CALL
========================================================= */

function startBingoAutoCall() {

    if (
        bingo.autoCall
    ) {

        return;

    }


    if (
        bingo.gameOver
    ) {

        return;

    }


    bingo.autoCall =
        true;


    const button =
        getBingoElement(
            "bingoAutoCall"
        );


    if (button) {

        button.classList.add(
            "active"
        );


        button.setAttribute(
            "aria-pressed",
            "true"
        );

    }


    /*
        Call immediately.
    */

    callBingoNumber();


    /*
        Continue calling.
    */

    bingo.autoCallTimer =
        setInterval(
            () => {

                if (
                    bingo.gameOver ||
                    bingo.availableNumbers.length === 0
                ) {

                    stopBingoAutoCall();

                    return;

                }


                callBingoNumber();

            },
            bingo.autoCallInterval
        );

}


/* =========================================================
   27. STOP AUTO CALL
========================================================= */

function stopBingoAutoCall() {

    if (
        bingo.autoCallTimer
    ) {

        clearInterval(
            bingo.autoCallTimer
        );


        bingo.autoCallTimer =
            null;

    }


    bingo.autoCall =
        false;


    const button =
        getBingoElement(
            "bingoAutoCall"
        );


    if (button) {

        button.classList.remove(
            "active"
        );


        button.setAttribute(
            "aria-pressed",
            "false"
        );

    }

}


/* =========================================================
   28. TOGGLE AUTO CALL
========================================================= */

function toggleBingoAutoCall() {

    if (
        bingo.autoCall
    ) {

        stopBingoAutoCall();


        showBingoMessage(
            "Auto Call paused."
        );

        return;

    }


    startBingoAutoCall();


    showBingoMessage(
        "Auto Call is running."
    );

}


/* =========================================================
   29. SETUP CONTROLS
========================================================= */

function setupBingoControls() {

    /*
        CALL NUMBER
    */

    const callButton =
        getBingoElement(
            "bingoCallNumber"
        );


    if (
        callButton &&
        callButton.dataset.bingoBound !==
            "true"
    ) {

        callButton.dataset.bingoBound =
            "true";


        callButton.addEventListener(
            "click",
            callBingoNumber
        );

    }


    /*
        AUTO CALL
    */

    const autoButton =
        getBingoElement(
            "bingoAutoCall"
        );


    if (
        autoButton &&
        autoButton.dataset.bingoBound !==
            "true"
    ) {

        autoButton.dataset.bingoBound =
            "true";


        autoButton.addEventListener(
            "click",
            toggleBingoAutoCall
        );

    }


    /*
        NEW GAME
    */

    const newGameButton =
        getBingoElement(
            "bingoNewGame"
        );


    if (
        newGameButton &&
        newGameButton.dataset.bingoBound !==
            "true"
    ) {

        newGameButton.dataset.bingoBound =
            "true";


        newGameButton.addEventListener(
            "click",
            startBingoGame
        );

    }


    /*
        PLAY AGAIN
    */

    const playAgainButton =
        getBingoElement(
            "bingoPlayAgain"
        );


    if (
        playAgainButton &&
        playAgainButton.dataset.bingoBound !==
            "true"
    ) {

        playAgainButton.dataset.bingoBound =
            "true";


        playAgainButton.addEventListener(
            "click",
            startBingoGame
        );

    }

}


/* =========================================================
   30. INITIALIZE BINGO
========================================================= */

function initBingo() {

    const room =
        getBingoElement(
            "bingoGame"
        );


    /*
        Bingo room isn't currently
        present in the DOM.

        This is normal when DigiCafe
        dynamically changes rooms.
    */

    if (!room) {

        console.log(
            "🎱 Bingo waiting for Playroom..."
        );


        return false;

    }


    console.log(
        "🎱 Initializing DigiCafe Bingo 2.0..."
    );


    /*
        Bind controls.
    */

    setupBingoCardSelection();

    setupBingoDaubModes();

    setupBingoControls();


    /*
        Start game once.
    */

    if (
        !bingo.initialized
    ) {

        bingo.initialized =
            true;


        startBingoGame();

    }

    else {

        /*
            Room may have been recreated
            by DigiCafe.
        */

        renderBingoCards();

        renderBingoCalledNumbers();

        updateBingoStats();

        updateBingoCaller();

        updateBingoCardCountLabel();

    }


    return true;

}


/* =========================================================
   31. RESET INITIALIZATION
========================================================= */

function resetBingoInitialization() {

    stopBingoAutoCall();


    bingo.initialized =
        false;


    bingo.cards =
        [];


    bingo.calledNumbers =
        [];


    bingo.availableNumbers =
        [];


    bingo.currentNumber =
        null;


    bingo.currentLetter =
        null;


    bingo.gameStarted =
        false;


    bingo.gameOver =
        false;

}


/* =========================================================
   32. GLOBAL ACCESS
========================================================= */

window.bingo =
    bingo;


window.initBingo =
    initBingo;


window.startBingoGame =
    startBingoGame;


window.callBingoNumber =
    callBingoNumber;


window.toggleBingoAutoCall =
    toggleBingoAutoCall;


window.daubBingoCell =
    daubBingoCell;


window.resetBingoInitialization =
    resetBingoInitialization;


/* =========================================================
   33. LOADED
========================================================= */

console.log(
    "🎱 DigiCafe Bingo 2.0 — Core engine loaded."
);
