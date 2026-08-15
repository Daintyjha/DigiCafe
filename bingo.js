/* =========================================================
   DIGICAFE BINGO
   MATCHED TO NEW BINGO HTML
   =========================================================

   FEATURES
   ---------------------------------------------------------
   • 75-ball Bingo
   • 1–4 cards
   • Manual / Auto Daub
   • Coffee XP system
   • 3 successful daubs = random power-up
   • Lucky Daub
   • Number Boost
   • Double Daub
   • Auto calling
   • Bingo detection
   • New Game
   • Play Again
   • Dynamic Playroom compatible
========================================================= */


/* =========================================================
   01. GAME STATE
========================================================= */

const bingo = {

    initialized: false,

    cards: [],

    cardCount: 1,

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

    gameOver: false,

    /* Coffee XP */

    coffeeXP: 0,

    coffeeMaxXP: 3,

    /* Current power-up */

    powerUp: null,

    powerUpReady: false,

    powerUpCooldown: false,

    powerUpCooldownSeconds: 0,

    powerUpCooldownTimer: null,

    /* Double Daub */

    doubleDaubActive: false,

    /* Number Boost */

    numberBoostActive: false

};


/* =========================================================
   02. POWER-UPS
========================================================= */

const bingoPowerUps = [

    {
        id: "lucky-daub",
        icon: "🍀",
        name: "Lucky Daub",
        description:
            "Marks one currently called number."
    },

    {
        id: "number-boost",
        icon: "⚡",
        name: "Number Boost",
        description:
            "Highlights called numbers on all cards."
    },

    {
        id: "double-daub",
        icon: "✨",
        name: "Double Daub",
        description:
            "Your next successful daub gives 2 XP."
    }

];


/* =========================================================
   03. DOM HELPER
========================================================= */

function getBingoElement(id) {

    return document.getElementById(id);

}


/* =========================================================
   04. NUMBER POOL
========================================================= */

function createBingoNumberPool() {

    return Array.from(
        { length: 75 },
        (_, index) => index + 1
    );

}


/* =========================================================
   05. SHUFFLE
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
   06. BINGO LETTER
========================================================= */

function getBingoLetter(number) {

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
   07. GENERATE ONE CARD
========================================================= */

function generateBingoCard() {

    const ranges = [

        [1, 15],
        [16, 30],
        [31, 45],
        [46, 60],
        [61, 75]

    ];


    const columns = ranges.map(
        ([min, max]) => {

            const numbers =
                Array.from(
                    {
                        length:
                            max - min + 1
                    },
                    (_, index) =>
                        min + index
                );

            return shuffleBingoNumbers(
                numbers
            ).slice(0, 5);

        }
    );


    const card = [];


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
                    getBingoLetter(
                        number
                    ),

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
   08. GENERATE ALL CARDS
========================================================= */

function generateBingoCards() {

    bingo.cards = [];


    for (
        let i = 0;
        i < bingo.cardCount;
        i++
    ) {

        bingo.cards.push(
            generateBingoCard()
        );

    }

}


/* =========================================================
   09. RESET GAME
========================================================= */

function resetBingoGameState() {

    stopBingoAutoCall();

    stopBingoCooldown();


    bingo.cards = [];

    bingo.calledNumbers = [];

    bingo.availableNumbers =
        shuffleBingoNumbers(
            createBingoNumberPool()
        );


    bingo.currentNumber = null;

    bingo.currentLetter = null;

    bingo.coffeeXP = 0;

    bingo.powerUp = null;

    bingo.powerUpReady = false;

    bingo.powerUpCooldown = false;

    bingo.powerUpCooldownSeconds = 0;

    bingo.doubleDaubActive = false;

    bingo.numberBoostActive = false;

    bingo.gameStarted = false;

    bingo.gameOver = false;

}


/* =========================================================
   10. START GAME
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


    resetBingoGameState();


    generateBingoCards();


    bingo.gameStarted = true;


    hideBingoWin();


    updateBingoCardSelectionUI();

    updateBingoCardCountLabel();

    updateBingoStats();

    updateBingoCoffee();

    updateBingoPowerUpUI();

    renderBingoCards();

    renderBingoCalledNumbers();

    resetBingoCaller();


    showBingoMessage(
        "Your cards are ready. Press CALL NUMBER to begin!"
    );


    console.log(
        "🎱 DigiCafe Bingo started."
    );


    return true;

}


/* =========================================================
   11. RESET CALLER
========================================================= */

function resetBingoCaller() {

    const letter =
        getBingoElement(
            "bingoCurrentLetter"
        );

    const number =
        getBingoElement(
            "bingoCurrentNumber"
        );


    if (letter) {
        letter.textContent = "READY";
    }


    if (number) {
        number.textContent = "—";
    }

}


/* =========================================================
   12. UPDATE STATS
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
   13. CARD COUNT LABEL
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
   14. CARD SELECTION UI
========================================================= */

function updateBingoCardSelectionUI() {

    const options =
        document.querySelectorAll(
            "[data-card-count]"
        );


    options.forEach(
        option => {

            const count =
                Number(
                    option.dataset.cardCount
                );


            const active =
                count === bingo.cardCount;


            option.classList.toggle(
                "active",
                active
            );


            option.setAttribute(
                "aria-pressed",
                String(active)
            );

        }
    );

}


/* =========================================================
   15. CARD SELECTION
========================================================= */

function setupBingoCardSelection() {

    const options =
        document.querySelectorAll(
            "[data-card-count]"
        );


    options.forEach(
        option => {

            if (
                option.dataset.bingoBound === "true"
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
                        count < 1 ||
                        count > 4
                    ) {
                        return;
                    }


                    bingo.cardCount =
                        count;


                    updateBingoCardSelectionUI();


                    /*
                        If the game has not started
                        calling numbers yet,
                        regenerate cards.
                    */

                    if (
                        bingo.calledNumbers.length === 0
                    ) {

                        generateBingoCards();

                        renderBingoCards();

                        updateBingoCardCountLabel();

                    }

                }
            );

        }
    );

}


/* =========================================================
   16. DAUB MODE
========================================================= */

function setupBingoDaubModes() {

    const options =
        document.querySelectorAll(
            "[data-daub-mode]"
        );


    options.forEach(
        option => {

            if (
                option.dataset.bingoBound === "true"
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


                    if (
                        mode === "auto"
                    ) {

                        autoDaubAllCards();

                        showBingoMessage(
                            "✨ Auto-Daub enabled."
                        );

                    }

                    else {

                        showBingoMessage(
                            "✋ Manual Daub enabled."
                        );

                    }

                }
            );

        }
    );

}


/* =========================================================
   17. CALL NUMBER
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


    bingo.gameStarted = true;


    const number =
        bingo.availableNumbers.pop();


    bingo.currentNumber =
        number;


    bingo.currentLetter =
        getBingoLetter(number);


    bingo.calledNumbers.push(
        number
    );


    updateBingoCaller();

    updateBingoStats();

    renderBingoCalledNumbers();


    /*
        AUTO DAUB
    */

    if (
        bingo.daubMode === "auto"
    ) {

        autoDaubAllCards();

    }


    /*
        NUMBER BOOST
    */

    if (
        bingo.numberBoostActive
    ) {

        renderBingoCards();

    }


    showBingoMessage(
        `${bingo.currentLetter} ${number} called!`
    );


    checkBingoWin();


    return number;

}


/* =========================================================
   18. UPDATE CALLER
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
   19. NUMBER CALLED?
========================================================= */

function isBingoNumberCalled(number) {

    return bingo.calledNumbers.includes(
        number
    );

}


/* =========================================================
   20. DAUB CELL
========================================================= */

function daubBingoCell(
    cardIndex,
    row,
    column
) {

    if (
        bingo.gameOver
    ) {
        return false;
    }


    const card =
        bingo.cards[cardIndex];


    if (!card) {
        return false;
    }


    const cell =
        card[row]?.[column];


    if (!cell) {
        return false;
    }


    if (cell.free) {
        return false;
    }


    if (cell.marked) {
        return false;
    }


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


    cell.marked = true;


    rewardSuccessfulBingoDaub();


    renderBingoCards();


    checkBingoWin();


    return true;

}


/* =========================================================
   21. SUCCESSFUL DAUB
========================================================= */

function rewardSuccessfulBingoDaub() {

    const amount =
        bingo.doubleDaubActive
            ? 2
            : 1;


    bingo.doubleDaubActive =
        false;


    addBingoCoffeeXP(
        amount
    );


    if (
        amount === 2
    ) {

        showBingoMessage(
            "✨ Double Daub! Coffee +2 XP."
        );

    }

    else {

        showBingoMessage(
            "☕ Successful daub! Coffee +1 XP."
        );

    }

}


/* =========================================================
   22. ADD COFFEE XP
========================================================= */

function addBingoCoffeeXP(
    amount = 1
) {

    if (
        bingo.powerUpReady ||
        bingo.powerUpCooldown
    ) {
        return;
    }


    bingo.coffeeXP =
        Math.min(
            bingo.coffeeMaxXP,
            bingo.coffeeXP + amount
        );


    updateBingoCoffee();


    if (
        bingo.coffeeXP >=
        bingo.coffeeMaxXP
    ) {

        brewBingoPowerUp();

    }

}


/* =========================================================
   23. UPDATE COFFEE
========================================================= */

function updateBingoCoffee() {

    const fill =
        getBingoElement(
            "bingoCoffeeFill"
        );

    const xp =
        getBingoElement(
            "bingoPowerupXP"
        );

    const text =
        getBingoElement(
            "bingoPowerupXPText"
        );

    const cup =
        document.querySelector(
            ".bingo-coffee-cup"
        );


    const percent =
        (
            bingo.coffeeXP /
            bingo.coffeeMaxXP
        ) * 100;


    if (fill) {

        fill.style.height =
            `${percent}%`;

    }


    if (xp) {

        xp.textContent =
            `${bingo.coffeeXP} / ${bingo.coffeeMaxXP}`;

    }


    if (text) {

        if (
            bingo.powerUpReady
        ) {

            text.textContent =
                "Your coffee is ready!";

        }

        else if (
            bingo.powerUpCooldown
        ) {

            text.textContent =
                "Power-up cooldown...";

        }

        else if (
            bingo.coffeeXP === 0
        ) {

            text.textContent =
                "Your coffee is brewing...";

        }

        else if (
            bingo.coffeeXP === 1
        ) {

            text.textContent =
                "Getting warm...";

        }

        else {

            text.textContent =
                "Almost ready...";

        }

    }


    if (cup) {

        cup.classList.toggle(
            "coffee-ready",
            bingo.powerUpReady
        );

        cup.classList.toggle(
            "coffee-cooldown",
            bingo.powerUpCooldown
        );

    }

}


/* =========================================================
   24. BREW POWER-UP
========================================================= */

function brewBingoPowerUp() {

    if (
        bingo.powerUpReady ||
        bingo.powerUpCooldown
    ) {
        return;
    }


    const randomIndex =
        Math.floor(
            Math.random() *
            bingoPowerUps.length
        );


    bingo.powerUp =
        bingoPowerUps[
            randomIndex
        ];


    bingo.powerUpReady =
        true;


    bingo.coffeeXP =
        bingo.coffeeMaxXP;


    updateBingoCoffee();

    updateBingoPowerUpUI();


    showBingoMessage(
        `☕✨ Your coffee brewed: ${bingo.powerUp.name}!`
    );


    console.log(
        "☕ Bingo power-up ready:",
        bingo.powerUp.id
    );

}


/* =========================================================
   25. POWER-UP UI
========================================================= */

function updateBingoPowerUpUI() {

    const icon =
        getBingoElement(
            "bingoPowerupStatusIcon"
        );

    const title =
        getBingoElement(
            "bingoPowerupStatusTitle"
        );

    const description =
        getBingoElement(
            "bingoPowerupStatusText"
        );

    const timer =
        getBingoElement(
            "bingoPowerupTimer"
        );


    const options =
        document.querySelectorAll(
            ".bingo-powerup-option"
        );


    /*
        READY
    */

    if (
        bingo.powerUpReady &&
        bingo.powerUp
    ) {

        if (icon) {

            icon.textContent =
                bingo.powerUp.icon;

        }


        if (title) {

            title.textContent =
                `${bingo.powerUp.name} READY`;

        }


        if (description) {

            description.textContent =
                bingo.powerUp.description;

        }


        if (timer) {

            timer.textContent =
                "POWER-UP READY";

        }

    }


    /*
        COOLDOWN
    */

    else if (
        bingo.powerUpCooldown
    ) {

        if (icon) {
            icon.textContent = "⏳";
        }


        if (title) {
            title.textContent =
                "POWER-UP COOLDOWN";
        }


        if (description) {

            description.textContent =
                "Your coffee will start brewing again soon.";

        }


        if (timer) {

            timer.textContent =
                `${bingo.powerUpCooldownSeconds}s`;

        }

    }


    /*
        BREWING
    */

    else {

        if (icon) {
            icon.textContent = "☕";
        }


        if (title) {
            title.textContent =
                "Coffee is brewing";
        }


        if (description) {

            description.textContent =
                "Daub 3 called numbers to receive a random power-up.";

        }


        if (timer) {
            timer.textContent = "BREWING";
        }

    }


    /*
        UPDATE BUTTONS
    */

    options.forEach(
        option => {

            const id =
                option.dataset.powerup;


            const ready =
                bingo.powerUpReady &&
                bingo.powerUp &&
                bingo.powerUp.id === id;


            option.disabled =
                !ready;


            option.hidden =
                !ready;


            option.classList.toggle(
                "ready",
                ready
            );


            const label =
                option.querySelector(
                    "[data-powerup-ready]"
                );


            if (label) {

                label.textContent =
                    ready
                        ? "USE"
                        : "LOCKED";

            }

        }
    );


    updateBingoCoffee();

}


/* =========================================================
   26. USE POWER-UP
========================================================= */

function useBingoPowerUp() {

    if (
        !bingo.powerUpReady ||
        !bingo.powerUp
    ) {
        return false;
    }


    const powerUp =
        bingo.powerUp;


    let used = false;


    switch (
        powerUp.id
    ) {

        case "lucky-daub":

            used =
                useLuckyDaub();

            break;


        case "number-boost":

            used =
                useNumberBoost();

            break;


        case "double-daub":

            used =
                useDoubleDaub();

            break;

    }


    if (!used) {
        return false;
    }


    bingo.powerUp =
        null;


    bingo.powerUpReady =
        false;


    bingo.coffeeXP =
        0;


    startBingoPowerUpCooldown();


    updateBingoPowerUpUI();


    return true;

}


/* =========================================================
   27. LUCKY DAUB
========================================================= */

function useLuckyDaub() {

    const candidates = [];


    bingo.cards.forEach(
        (
            card,
            cardIndex
        ) => {

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

                            if (
                                cell.free ||
                                cell.marked
                            ) {
                                return;
                            }


                            if (
                                isBingoNumberCalled(
                                    cell.number
                                )
                            ) {

                                candidates.push({

                                    cardIndex,

                                    row:
                                        rowIndex,

                                    column:
                                        columnIndex

                                });

                            }

                        }
                    );

                }
            );

        }
    );


    if (
        candidates.length === 0
    ) {

        showBingoMessage(
            "🍀 Lucky Daub needs a called number."
        );

        return false;

    }


    const selected =
        candidates[
            Math.floor(
                Math.random() *
                candidates.length
            )
        ];


    const cell =
        bingo.cards[
            selected.cardIndex
        ][
            selected.row
        ][
            selected.column
        ];


    cell.marked = true;


    renderBingoCards();


    showBingoMessage(
        `🍀 Lucky Daub marked ${cell.number}!`
    );


    checkBingoWin();


    return true;

}


/* =========================================================
   28. NUMBER BOOST
========================================================= */

function useNumberBoost() {

    bingo.numberBoostActive =
        true;


    renderBingoCards();


    showBingoMessage(
        "⚡ Number Boost activated! Called numbers are highlighted."
    );


    /*
        Keep the effect for 15 seconds.
    */

    setTimeout(
        () => {

            bingo.numberBoostActive =
                false;


            renderBingoCards();

        },
        15000
    );


    return true;

}


/* =========================================================
   29. DOUBLE DAUB
========================================================= */

function useDoubleDaub() {

    bingo.doubleDaubActive =
        true;


    showBingoMessage(
        "✨ Double Daub ready! Your next successful daub gives 2 XP."
    );


    return true;

}


/* =========================================================
   30. AUTO DAUB
========================================================= */

function autoDaubAllCards() {

    bingo.cards.forEach(
        card => {

            card.forEach(
                row => {

                    row.forEach(
                        cell => {

                            if (
                                cell.free ||
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

                            }

                        }
                    );

                }
            );

        }
    );


    renderBingoCards();


    checkBingoWin();

}


/* =========================================================
   31. RENDER CARDS
========================================================= */

function renderBingoCards() {

    const container =
        getBingoElement(
            "bingoCards"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


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
                CARD TITLE
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
                GRID
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
                CELLS
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
                                FREE
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


                            /*
                                NORMAL NUMBER
                            */

                            else {

                                button.textContent =
                                    cell.number;

                            }


                            /*
                                CALLED
                            */

                            if (
                                !cell.free &&
                                isBingoNumberCalled(
                                    cell.number
                                )
                            ) {

                                button.classList.add(
                                    "called"
                                );

                            }


                            /*
                                MARKED
                            */

                            if (
                                cell.marked
                            ) {

                                button.classList.add(
                                    "marked"
                                );

                            }


                            /*
                                DAUBABLE
                            */

                            if (
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
                                NUMBER BOOST
                            */

                            if (
                                bingo.numberBoostActive &&
                                !cell.free &&
                                isBingoNumberCalled(
                                    cell.number
                                )
                            ) {

                                button.classList.add(
                                    "number-boost"
                                );

                            }


                            /*
                                CLICK
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
   32. CALLED NUMBERS
========================================================= */

function renderBingoCalledNumbers() {

    const container =
        getBingoElement(
            "bingoCalledNumbers"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


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


    const sorted =
        [...bingo.calledNumbers]
            .sort(
                (a, b) => a - b
            );


    sorted.forEach(
        number => {

            const element =
                document.createElement(
                    "span"
                );


            element.className =
                "bingo-called-number";


            element.textContent =
                `${getBingoLetter(number)} ${number}`;


            if (
                number ===
                bingo.currentNumber
            ) {

                element.classList.add(
                    "current"
                );

            }


            container.appendChild(
                element
            );

        }
    );

}


/* =========================================================
   33. CHECK WIN
========================================================= */

function checkBingoWin() {

    if (
        bingo.gameOver
    ) {
        return false;
    }


    for (
        let cardIndex = 0;
        cardIndex < bingo.cards.length;
        cardIndex++
    ) {

        if (
            isWinningBingoCard(
                bingo.cards[cardIndex]
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
   34. WINNING CARD
========================================================= */

function isWinningBingoCard(card) {

    /*
        ROWS
    */

    for (
        let row = 0;
        row < 5;
        row++
    ) {

        if (
            card[row].every(
                cell =>
                    cell.marked ||
                    cell.free
            )
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

        let complete = true;


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

                complete = false;

                break;

            }

        }


        if (complete) {
            return true;
        }

    }


    /*
        DIAGONAL 1
    */

    let diagonalOne = true;


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

            diagonalOne = false;

            break;

        }

    }


    if (diagonalOne) {
        return true;
    }


    /*
        DIAGONAL 2
    */

    let diagonalTwo = true;


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

            diagonalTwo = false;

            break;

        }

    }


    return diagonalTwo;

}


/* =========================================================
   35. SHOW WIN
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
            `BINGO! Card ${cardIndex + 1} completed a line. Nicely played, besh. ☕`;

    }


    win.hidden =
        false;


    win.style.display =
        "flex";

}


/* =========================================================
   36. HIDE WIN
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
   37. MESSAGE
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
   38. AUTO CALL
========================================================= */

function startBingoAutoCall() {

    if (
        bingo.autoCall ||
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
   39. STOP AUTO CALL
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
   40. TOGGLE AUTO CALL
========================================================= */

function toggleBingoAutoCall() {

    if (
        bingo.autoCall
    ) {

        stopBingoAutoCall();


        showBingoMessage(
            "Auto Call paused."
        );

    }

    else {

        startBingoAutoCall();


        if (!bingo.gameOver) {

            showBingoMessage(
                "Auto Call is running."
            );

        }

    }

}


/* =========================================================
   41. POWER-UP COOLDOWN
========================================================= */

function startBingoPowerUpCooldown() {

    stopBingoCooldown();


    bingo.powerUpCooldown =
        true;


    bingo.powerUpCooldownSeconds =
        5;


    updateBingoPowerUpUI();


    const cooldown =
        getBingoElement(
            "bingoPowerupCooldown"
        );


    const time =
        getBingoElement(
            "bingoPowerupCooldownTime"
        );


    if (cooldown) {

        cooldown.hidden =
            false;

    }


    if (time) {

        time.textContent =
            bingo.powerUpCooldownSeconds;

    }


    bingo.powerUpCooldownTimer =
        setInterval(
            () => {

                bingo.powerUpCooldownSeconds--;


                if (time) {

                    time.textContent =
                        bingo.powerUpCooldownSeconds;

                }


                if (
                    bingo.powerUpCooldownSeconds <= 0
                ) {

                    stopBingoCooldown();


                    bingo.coffeeXP =
                        0;


                    updateBingoCoffee();

                    updateBingoPowerUpUI();


                    showBingoMessage(
                        "☕ Your coffee is brewing again!"
                    );

                }

            },
            1000
        );

}


/* =========================================================
   42. STOP COOLDOWN
========================================================= */

function stopBingoCooldown() {

    if (
        bingo.powerUpCooldownTimer
    ) {

        clearInterval(
            bingo.powerUpCooldownTimer
        );


        bingo.powerUpCooldownTimer =
            null;

    }


    bingo.powerUpCooldown =
        false;


    bingo.powerUpCooldownSeconds =
        0;


    const cooldown =
        getBingoElement(
            "bingoPowerupCooldown"
        );


    if (cooldown) {

        cooldown.hidden =
            true;

    }

}


/* =========================================================
   43. POWER-UP BUTTONS
========================================================= */

function setupBingoPowerUpButtons() {

    const buttons =
        document.querySelectorAll(
            ".bingo-powerup-option"
        );


    buttons.forEach(
        button => {

            if (
                button.dataset.bingoBound === "true"
            ) {
                return;
            }


            button.dataset.bingoBound =
                "true";


            button.addEventListener(
                "click",
                () => {

                    if (
                        button.disabled
                    ) {
                        return;
                    }


                    useBingoPowerUp();

                }
            );

        }
    );

}


/* =========================================================
   44. MAIN CONTROLS
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
        callButton.dataset.bingoBound !== "true"
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
        autoButton.dataset.bingoBound !== "true"
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

    const newGame =
        getBingoElement(
            "bingoNewGame"
        );


    if (
        newGame &&
        newGame.dataset.bingoBound !== "true"
    ) {

        newGame.dataset.bingoBound =
            "true";


        newGame.addEventListener(
            "click",
            startBingoGame
        );

    }


    /*
        PLAY AGAIN
    */

    const playAgain =
        getBingoElement(
            "bingoPlayAgain"
        );


    if (
        playAgain &&
        playAgain.dataset.bingoBound !== "true"
    ) {

        playAgain.dataset.bingoBound =
            "true";


        playAgain.addEventListener(
            "click",
            startBingoGame
        );

    }

}


/* =========================================================
   45. INITIALIZE
========================================================= */

function initBingo() {

    const room =
        getBingoElement(
            "bingoGame"
        );


    if (!room) {

        console.log(
            "🎱 Bingo waiting for Playroom..."
        );

        return false;

    }


    console.log(
        "🎱 Initializing DigiCafe Bingo..."
    );


    setupBingoCardSelection();

    setupBingoDaubModes();

    setupBingoPowerUpButtons();

    setupBingoControls();


    /*
        Start game if this is
        the first initialization.
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
            Room may have been
            recreated dynamically.
        */

        updateBingoCardSelectionUI();

        renderBingoCards();

        renderBingoCalledNumbers();

        updateBingoStats();

        updateBingoCoffee();

        updateBingoPowerUpUI();

    }


    return true;

}


/* =========================================================
   46. RESET INITIALIZATION
========================================================= */

function resetBingoInitialization() {

    stopBingoAutoCall();

    stopBingoCooldown();


    bingo.initialized =
        false;


    bingo.cards =
        [];


    bingo.calledNumbers =
        [];


    bingo.availableNumbers =
        [];


    bingo.powerUp =
        null;


    bingo.powerUpReady =
        false;


    bingo.coffeeXP =
        0;


    bingo.doubleDaubActive =
        false;


    bingo.numberBoostActive =
        false;

}


/* =========================================================
   47. GLOBAL ACCESS
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


window.useBingoPowerUp =
    useBingoPowerUp;


window.resetBingoInitialization =
    resetBingoInitialization;


console.log(
    "🎱 DigiCafe Bingo — NEW HTML ENGINE LOADED ☕"
);
