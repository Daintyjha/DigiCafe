/* =========================================================
   DIGICAFE BINGO
   COMPLETE CLEAN ENGINE
   ---------------------------------------------------------
   DESIGNED FOR:
   • DigiCafe Playroom
   • Dynamic Bingo room creation
   • Current Bingo HTML
   • Current Bingo CSS

   POWER-UPS:
   🎁 Treasure
   ☕ Single Daub
   ☕☕ Double Daub
   ⭐ Instant Bingo

   BREWER:
   • 3 successful daubs
   • Ready state
   • Random power-up reveal
   • Random card + random number target
   • 5-minute cooldown
========================================================= */

(() => {

    "use strict";


    /* =====================================================
       01. CONFIGURATION
    ===================================================== */

    const CONFIG = {

        startingCredits: 300,

        cardCosts: {
            1: 10,
            2: 20,
            3: 30,
            4: 40
        },

        maxCards: 4,

        totalNumbers: 75,

        brewerRequiredDaubs: 3,

        brewerCooldownMs:
            0.1 * 60 * 1000,

        autoCallInterval:
            3000,

        dailyResets: 3,

        normalWinMin: 50,

        normalWinMax: 100,

        instantWinMin: 100,

        instantWinMax: 250,

        treasureCoinMin: 25,

        treasureCoinMax: 150,

        storageKey:
            "digicafe_bingo_wallet"

    };


    /* =====================================================
       02. POWER-UPS
    ===================================================== */

    const POWER_UPS = [

        {
            id: "treasure",

            icon: "🎁",

            name: "TREASURE",

            description:
                "A surprise gift is waiting on this number."

        },

        {
            id: "single-daub",

            icon: "☕",

            name: "SINGLE DAUB",

            description:
                "This target number will be daubed for you."

        },

        {
            id: "double-daub",

            icon: "☕☕",

            name: "DOUBLE DAUB",

            description:
                "This target number receives a double daub."

        },

        {
            id: "instant-bingo",

            icon: "⭐",

            name: "INSTANT BINGO",

            description:
                "Calling this target number gives an instant Bingo."

        }

    ];


    /* =====================================================
       03. GAME STATE
    ===================================================== */

    const bingo = {

        initialized: false,

        eventsAttached: false,

        observerAttached: false,

        syncScheduled: false,

        room: null,

        cards: [],

        cardCount: 1,

        calledNumbers: [],

        availableNumbers: [],

        currentNumber: null,

        currentLetter: null,

        daubMode: "manual",

        autoCall: false,

        autoCallTimer: null,

        gameStarted: false,

        gameOver: false,

        wins: 0,

        credits: CONFIG.startingCredits,

        dailyResetsUsed: 0,

        resetDate: null,

        totalDaubs: 0,

        brewerDaubs: 0,

        brewerReady: false,

        brewerCooldownUntil: 0,

        currentPowerUp: null,

        powerUpTarget: null,

        wildActive: false,

        lastWinReward: 0

    };


    let brewerRefreshTimer = null;


    /* =====================================================
       04. ROOM / DOM HELPERS
    ===================================================== */

    function getRoom() {

        const room =
            document.getElementById(
                "bingoGame"
            );

        if (room) {

            bingo.room =
                room;

        }

        return bingo.room;

    }


    function getElement(id) {

        return document.getElementById(
            id
        );

    }


    function query(selector) {

        const room =
            getRoom();

        if (!room) {

            return null;

        }

        return room.querySelector(
            selector
        );

    }


    /* =====================================================
       05. RESULT MESSAGE
    ===================================================== */

    function showResult(message) {

        const result =
            getElement(
                "bingoResult"
            );

        if (!result) {

            return;

        }

        result.textContent =
            message;

    }


    /* =====================================================
       06. DATE
    ===================================================== */

    function getDateKey() {

        const now =
            new Date();

        const year =
            now.getFullYear();

        const month =
            String(
                now.getMonth() + 1
            ).padStart(
                2,
                "0"
            );

        const day =
            String(
                now.getDate()
            ).padStart(
                2,
                "0"
            );

        return (
            `${year}-${month}-${day}`
        );

    }


    /* =====================================================
       07. RANDOM HELPERS
    ===================================================== */

    function randomInt(
        min,
        max
    ) {

        if (
            max <= min
        ) {

            return min;

        }

        return Math.floor(
            Math.random() *
            (
                max - min + 1
            )
        ) + min;

    }


    function shuffle(
        array
    ) {

        const copy =
            [...array];


        for (
            let index =
                copy.length - 1;

            index > 0;

            index--
        ) {

            const randomIndex =
                Math.floor(
                    Math.random() *
                    (
                        index + 1
                    )
                );


            [
                copy[index],
                copy[randomIndex]
            ] =
            [
                copy[randomIndex],
                copy[index]
            ];

        }


        return copy;

    }


    /* =====================================================
       08. BINGO LETTERS
    ===================================================== */

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


    function getNumberLabel(
        number
    ) {

        if (
            !Number.isInteger(number)
        ) {

            return "—";

        }


        return (
            `${getBingoLetter(number)} ${number}`
        );

    }


    /* =====================================================
       09. STORAGE
    ===================================================== */

    function loadWallet() {

        const today =
            getDateKey();


        try {

            const saved =
                localStorage.getItem(
                    CONFIG.storageKey
                );


            if (!saved) {

                bingo.credits =
                    CONFIG.startingCredits;

                bingo.dailyResetsUsed =
                    0;

                bingo.resetDate =
                    today;

                saveWallet();

                return;

            }


            const wallet =
                JSON.parse(
                    saved
                );


            bingo.credits =
                Number.isFinite(
                    Number(
                        wallet.credits
                    )
                )
                    ? Number(
                        wallet.credits
                    )
                    : CONFIG.startingCredits;


            bingo.dailyResetsUsed =
                Number.isFinite(
                    Number(
                        wallet.dailyResetsUsed
                    )
                )
                    ? Number(
                        wallet.dailyResetsUsed
                    )
                    : 0;


            bingo.resetDate =
                wallet.resetDate ||
                today;


            if (
                bingo.resetDate !==
                today
            ) {

                bingo.dailyResetsUsed =
                    0;

                bingo.resetDate =
                    today;

            }


            saveWallet();

        }

        catch (error) {

            console.warn(
                "🎱 Could not load Bingo wallet.",
                error
            );

            bingo.credits =
                CONFIG.startingCredits;

            bingo.dailyResetsUsed =
                0;

            bingo.resetDate =
                today;

        }

    }


    function saveWallet() {

        try {

            localStorage.setItem(

                CONFIG.storageKey,

                JSON.stringify({

                    credits:
                        bingo.credits,

                    dailyResetsUsed:
                        bingo.dailyResetsUsed,

                    resetDate:
                        bingo.resetDate

                })

            );

        }

        catch (error) {

            console.warn(
                "🎱 Could not save Bingo wallet.",
                error
            );

        }

    }


    /* =====================================================
       10. CREDITS
    ===================================================== */

    function updateCreditsUI() {

        const balance =
            query(
                "[data-bingo-credit-balance]"
            );


        if (balance) {

            balance.textContent =
                bingo.credits;

        }


        const reset =
            getElement(
                "bingoDailyResets"
            );


        if (reset) {

            reset.textContent =
                Math.max(
                    0,
                    CONFIG.dailyResets -
                    bingo.dailyResetsUsed
                );

        }

    }


    function addBingoCredits(
        amount
    ) {

        amount =
            Number(amount);


        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {

            return false;

        }


        bingo.credits +=
            amount;


        updateCreditsUI();

        saveWallet();


        return true;

    }


    function spendBingoCredits(
        amount
    ) {

        amount =
            Number(amount);


        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {

            return false;

        }


        if (
            bingo.credits <
            amount
        ) {

            showResult(
                `💰 Not enough Café Credits. You need ${amount} credits.`
            );

            return false;

        }


        bingo.credits -=
            amount;


        updateCreditsUI();

        saveWallet();


        return true;

    }


    function resetBingoCredits() {

        if (
            bingo.dailyResetsUsed >=
            CONFIG.dailyResets
        ) {

            showResult(
                "☕ No daily credit resets left today."
            );

            return false;

        }


        bingo.credits =
            CONFIG.startingCredits;


        bingo.dailyResetsUsed++;


        bingo.resetDate =
            getDateKey();


        updateCreditsUI();

        saveWallet();


        showResult(
            `☕ Credits reset to ${CONFIG.startingCredits}.`
        );


        return true;

    }


    /* =====================================================
       11. CARD CREATION
    ===================================================== */

    function createBingoCard() {

        const ranges = [

            [1,15],

            [16,30],

            [31,45],

            [46,60],

            [61,75]

        ];


        const columns =
            ranges.map(
                ([min,max]) => {

                    const numbers =
                        Array.from(
                            {
                                length:
                                    max - min + 1
                            },
                            (_, index) =>
                                min + index
                        );


                    return shuffle(
                        numbers
                    ).slice(
                        0,
                        5
                    );

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

                if (
                    row === 2 &&
                    column === 2
                ) {

                    currentRow.push({

                        number:
                            null,

                        letter:
                            "N",

                        free:
                            true,

                        marked:
                            true

                    });

                    continue;

                }


                const number =
                    columns[column][row];


                currentRow.push({

                    number,

                    letter:
                        getBingoLetter(
                            number
                        ),

                    free:
                        false,

                    marked:
                        false

                });

            }


            card.push(
                currentRow
            );

        }


        return card;

    }


    function generateBingoCards() {

        bingo.cards = [];


        for (
            let index = 0;
            index < bingo.cardCount;
            index++
        ) {

            bingo.cards.push(
                createBingoCard()
            );

        }


        renderBingoCards();

    }


    /* =====================================================
       12. CARD RENDER
    ===================================================== */

    function renderBingoCards() {

        const container =
            getElement(
                "bingoCards"
            );


        if (!container) {

            return;

        }


        container.innerHTML =
            "";


        bingo.cards.forEach(
            (
                card,
                cardIndex
            ) => {

                const article =
                    document.createElement(
                        "article"
                    );


                article.className =
                    "bingo-card";


                article.dataset.cardIndex =
                    cardIndex;


                const title =
                    document.createElement(
                        "div"
                    );


                title.className =
                    "bingo-card-title";


                title.textContent =
                    `CARD ${cardIndex + 1}`;


                article.appendChild(
                    title
                );


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
                            "bingo-grid-header";


                        header.textContent =
                            letter;


                        grid.appendChild(
                            header
                        );

                    }
                );


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


                                if (
                                    cell.free
                                ) {

                                    button.classList.add(
                                        "free"
                                    );


                                    button.textContent =
                                        "FREE";


                                    button.disabled =
                                        true;

                                }

                                else {

                                    button.textContent =
                                        cell.number;


                                    button.dataset.number =
                                        cell.number;

                                }


                                if (
                                    cell.marked
                                ) {

                                    button.classList.add(
                                        "marked"
                                    );

                                }


                                grid.appendChild(
                                    button
                                );

                            }
                        );

                    }
                );


                article.appendChild(
                    grid
                );


                container.appendChild(
                    article
                );

            }
        );


        updateBingoCardSelectionUI();

        applyCalledVisuals();

        applyPowerUpVisuals();

    }


    /* =====================================================
       13. CARD SELECTION
       -----------------------------------------------------
       SELECTING CARDS DOES NOT CHARGE.
       NEW GAME CHARGES.
    ===================================================== */

    function updateBingoCardSelectionUI() {

        document
            .querySelectorAll(
                "#bingoGame [data-card-count]"
            )
            .forEach(
                button => {

                    const count =
                        Number(
                            button.dataset.cardCount
                        );


                    const active =
                        count ===
                        bingo.cardCount;


                    button.classList.toggle(
                        "active",
                        active
                    );


                    button.setAttribute(
                        "aria-pressed",
                        String(active)
                    );

                }
            );


        const label =
            getElement(
                "bingoCardCountLabel"
            );


        if (label) {

            label.textContent =
                bingo.cardCount === 1
                    ? "1 CARD"
                    : `${bingo.cardCount} CARDS`;

        }

    }


    function selectBingoCardCount(
        count
    ) {

        count =
            Number(count);


        if (
            !Number.isInteger(count) ||
            count < 1 ||
            count > CONFIG.maxCards
        ) {

            return false;

        }


        if (
            bingo.gameStarted &&
            bingo.calledNumbers.length > 0 &&
            !bingo.gameOver
        ) {

            showResult(
                "🎱 Finish this game before changing cards."
            );

            return false;

        }


        bingo.cardCount =
            count;


        generateBingoCards();


        const cost =
            CONFIG.cardCosts[
                count
            ];


        showResult(
            `${count} card${count === 1 ? "" : "s"} selected. New game costs ${cost} Café Credits.`
        );


        return true;

    }


    /* =====================================================
       14. START NEW GAME
    ===================================================== */

    function startBingoGame() {

        const cost =
            CONFIG.cardCosts[
                bingo.cardCount
            ];


        if (
            !spendBingoCredits(
                cost
            )
        ) {

            return false;

        }


        stopBingoAutoCall();


        bingo.calledNumbers =
            [];


        bingo.availableNumbers =
            shuffle(
                Array.from(
                    {
                        length:
                            CONFIG.totalNumbers
                    },
                    (_, index) =>
                        index + 1
                )
            );


        bingo.currentNumber =
            null;


        bingo.currentLetter =
            null;


        bingo.gameStarted =
            true;


        bingo.gameOver =
            false;


        bingo.totalDaubs =
            0;


        bingo.brewerDaubs =
            0;


        bingo.brewerReady =
            false;


        bingo.brewerCooldownUntil =
            0;


        bingo.currentPowerUp =
            null;


        bingo.powerUpTarget =
            null;


        bingo.wildActive =
            false;


        bingo.lastWinReward =
            0;


        generateBingoCards();


        resetBingoCaller();

        updateBingoStats();

        updateBingoBrewerUI();

        renderCalledNumbers();

        hideBingoWin();


        showResult(
            `🎱 New Bingo game started with ${bingo.cardCount} card${bingo.cardCount === 1 ? "" : "s"}. ${cost} credits used.`
        );


        saveWallet();


        return true;

    }


    /* =====================================================
       15. CALLER
    ===================================================== */

    function resetBingoCaller() {

        const letter =
            getElement(
                "bingoCurrentLetter"
            );


        const number =
            getElement(
                "bingoCurrentNumber"
            );


        if (letter) {

            letter.textContent =
                "READY";

        }


        if (number) {

            number.textContent =
                "—";

        }

    }


    function updateBingoCaller() {

        const letter =
            getElement(
                "bingoCurrentLetter"
            );


        const number =
            getElement(
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


    /* =====================================================
       16. STATS
    ===================================================== */

    function updateBingoStats() {

        const called =
            getElement(
                "bingoCalledCount"
            );


        const remaining =
            getElement(
                "bingoRemainingCount"
            );


        const wins =
            getElement(
                "bingoWins"
            );


        const total =
            getElement(
                "bingoCalledTotal"
            );


        if (called) {

            called.textContent =
                bingo.calledNumbers.length;

        }


        if (remaining) {

            remaining.textContent =
                (
                    CONFIG.totalNumbers -
                    bingo.calledNumbers.length
                );

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


    /* =====================================================
       17. GET DOM CELL
    ===================================================== */

    function getDomBingoCell(
        cardIndex,
        row,
        column
    ) {

        const room =
            getRoom();


        if (!room) {

            return null;

        }


        return room.querySelector(

            `.bingo-cell[data-card-index="${cardIndex}"][data-row="${row}"][data-column="${column}"]`

        );

    }


    /* =====================================================
       18. MARK CALLED VISUALS
    ===================================================== */

    function applyCalledVisuals() {

        const room =
            getRoom();


        if (!room) {

            return;

        }


        room
            .querySelectorAll(
                ".bingo-cell"
            )
            .forEach(
                cell => {

                    if (
                        cell.classList.contains(
                            "free"
                        )
                    ) {

                        return;

                    }


                    const number =
                        Number(
                            cell.dataset.number
                        );


                    const called =
                        bingo.calledNumbers.includes(
                            number
                        );


                    cell.classList.toggle(
                        "called",
                        called
                    );


                    const daubable =
                        bingo.gameStarted &&
                        !bingo.gameOver &&
                        called &&
                        !cell.classList.contains(
                            "marked"
                        ) &&
                        bingo.daubMode ===
                        "manual";


                    cell.classList.toggle(
                        "daubable",
                        daubable
                    );

                }
            );

    }


    /* =====================================================
       19. MANUAL DAUB
    ===================================================== */

    function daubBingoCell(
        cardIndex,
        rowIndex,
        columnIndex
    ) {

        if (
            !bingo.gameStarted ||
            bingo.gameOver
        ) {

            return false;

        }


        const card =
            bingo.cards[
                cardIndex
            ];


        const cell =
            card?.[
                rowIndex
            ]?.[
                columnIndex
            ];


        if (
            !cell ||
            cell.free ||
            cell.marked
        ) {

            return false;

        }


        /*
            Wild lets the player choose
            any unmarked number.
        */

        if (
            bingo.wildActive
        ) {

            return useBingoWild(
                cardIndex,
                rowIndex,
                columnIndex
            );

        }


        if (
            !bingo.calledNumbers.includes(
                cell.number
            )
        ) {

            showResult(
                `${getNumberLabel(cell.number)} has not been called yet.`
            );


            return false;

        }


        const success =
            markBingoCell(
                cardIndex,
                rowIndex,
                columnIndex,
                true
            );


        if (
            success
        ) {

            showResult(
                `☑️ You daubed ${getNumberLabel(cell.number)}.`
            );

        }


        checkBingo();


        return success;

    }


    /* =====================================================
       20. MARK CELL
    ===================================================== */

    function markBingoCell(
        cardIndex,
        rowIndex,
        columnIndex,
        countBrewer
    ) {

        const card =
            bingo.cards[
                cardIndex
            ];


        const cell =
            card?.[
                rowIndex
            ]?.[
                columnIndex
            ];


        if (
            !cell ||
            cell.free ||
            cell.marked
        ) {

            return false;

        }


        cell.marked =
            true;


        const domCell =
            getDomBingoCell(
                cardIndex,
                rowIndex,
                columnIndex
            );


        if (domCell) {

            domCell.classList.add(
                "marked"
            );


            domCell.classList.remove(
                "daubable"
            );


            domCell.classList.add(
                "auto-mark"
            );


            setTimeout(
                () => {

                    domCell.classList.remove(
                        "auto-mark"
                    );

                },
                450
            );

        }


        if (
            countBrewer
        ) {

            rewardSuccessfulBingoDaub();

        }


        return true;

    }


    /* =====================================================
       21. AUTO DAUB
    ===================================================== */

    function autoDaubCalledNumber(
        number
    ) {

        if (
            bingo.gameOver
        ) {

            return;

        }


        let successful =
            0;


        for (
            let cardIndex = 0;
            cardIndex < bingo.cards.length;
            cardIndex++
        ) {

            const card =
                bingo.cards[
                    cardIndex
                ];


            for (
                let rowIndex = 0;
                rowIndex < 5;
                rowIndex++
            ) {

                for (
                    let columnIndex = 0;
                    columnIndex < 5;
                    columnIndex++
                ) {

                    const cell =
                        card[
                            rowIndex
                        ][
                            columnIndex
                        ];


                    if (
                        cell.free ||
                        cell.marked
                    ) {

                        continue;

                    }


                    if (
                        cell.number !==
                        number
                    ) {

                        continue;

                    }


                    if (
                        markBingoCell(
                            cardIndex,
                            rowIndex,
                            columnIndex,
                            true
                        )
                    ) {

                        successful++;

                    }

                }

            }

        }


        if (
            successful > 0
        ) {

            showResult(
                `✨ Auto-Daub marked ${getNumberLabel(number)} on ${successful} card${successful === 1 ? "" : "s"}.`
            );

        }


        applyCalledVisuals();

    }


    /* =====================================================
       22. DAUB MODE
    ===================================================== */

    function setBingoDaubMode(
        mode
    ) {

        if (
            mode !== "manual" &&
            mode !== "auto"
        ) {

            return false;

        }


        bingo.daubMode =
            mode;


        document
            .querySelectorAll(
                "#bingoGame [data-daub-mode]"
            )
            .forEach(
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
                        String(active)
                    );

                }
            );


        if (
            mode === "auto" &&
            bingo.gameStarted
        ) {

            bingo.calledNumbers.forEach(
                number => {

                    autoDaubCalledNumber(
                        number
                    );

                }
            );


            checkBingo();


            showResult(
                "✨ Auto-Daub is ON. Called numbers are being marked automatically."
            );

        }

        else {

            applyCalledVisuals();


            showResult(
                "✋ Manual Daub is ON. Tap called numbers yourself."
            );

        }


        return true;

    }


    /* =====================================================
       23. SUCCESSFUL DAUB
    ===================================================== */

    function rewardSuccessfulBingoDaub() {

        bingo.totalDaubs++;


        /*
            Brewer does not collect daubs
            while READY or cooling.
        */

        if (
            bingo.brewerReady
        ) {

            return;

        }


        if (
            bingo.brewerCooldownUntil >
            Date.now()
        ) {

            return;

        }


        bingo.brewerDaubs++;


        if (
            bingo.brewerDaubs >=
            CONFIG.brewerRequiredDaubs
        ) {

            bingo.brewerDaubs =
                CONFIG.brewerRequiredDaubs;


            bingo.brewerReady =
                true;


            showResult(
                "☕ Your Coffee Brewer is READY! Tap the coffee to reveal a random power-up."
            );

        }


        updateBingoBrewerUI();

    }


    /* =====================================================
       24. CALL NUMBER
    ===================================================== */

    function callBingoNumber() {

        if (
            bingo.gameOver
        ) {

            showResult(
                "🎱 This game is finished. Start a new game."
            );

            return null;

        }


        if (
            !bingo.gameStarted
        ) {

            showResult(
                "🎱 Press NEW GAME before calling numbers."
            );

            return null;

        }


        if (
            bingo.calledNumbers.length >=
            CONFIG.totalNumbers
        ) {

            stopBingoAutoCall();


            showResult(
                "📢 All 75 numbers have been called."
            );


            return null;

        }


        let number;


        do {

            number =
                randomInt(
                    1,
                    CONFIG.totalNumbers
                );

        }
        while (
            bingo.calledNumbers.includes(
                number
            )
        );


        bingo.availableNumbers =
            bingo.availableNumbers.filter(
                available =>
                    available !==
                    number
            );


        bingo.calledNumbers.push(
            number
        );


        bingo.currentNumber =
            number;


        bingo.currentLetter =
            getBingoLetter(
                number
            );


        updateBingoCaller();

        updateBingoStats();

        renderCalledNumbers();

        applyCalledVisuals();


        /*
            First check whether a power-up
            target was hit.
        */

        const powerUpHit =
            checkPowerUpTarget(
                number
            );


        if (
            powerUpHit &&
            bingo.gameOver
        ) {

            return number;

        }


        /*
            Auto-Daub after the power-up
            check so special targets always
            get priority.
        */

        if (
            bingo.daubMode ===
            "auto" &&
            !bingo.gameOver
        ) {

            autoDaubCalledNumber(
                number
            );

        }


        if (
            !bingo.gameOver
        ) {

            checkBingo();

        }


        if (
            !bingo.gameOver
        ) {

            showResult(
                `📢 The number ${getNumberLabel(number)} has been called!`
            );

        }


        return number;

    }


    /* =====================================================
       25. RANDOM POWER-UP TARGET
    ===================================================== */

    function findRandomPowerUpTarget() {

        const targets = [];


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
                                    cell.free
                                ) {

                                    return;

                                }


                                targets.push({

                                    cardIndex,

                                    row:
                                        rowIndex,

                                    column:
                                        columnIndex,

                                    number:
                                        cell.number

                                });

                            }
                        );

                    }
                );

            }
        );


        if (
            targets.length === 0
        ) {

            return null;

        }


        return targets[
            randomInt(
                0,
                targets.length - 1
            )
        ];

    }


    /* =====================================================
       26. BREWER
    ===================================================== */

    function updateBingoBrewerUI() {

        const cup =
            getElement(
                "bingoCoffeeCup"
            );


        const fill =
            getElement(
                "bingoCoffeeFill"
            );


        const timer =
            getElement(
                "bingoPowerupTimer"
            );


        const title =
            getElement(
                "bingoPowerupStatusTitle"
            );


        const text =
            getElement(
                "bingoPowerupStatusText"
            );


        const status =
            getElement(
                "bingoPowerupStatus"
            );


        const cooldownBox =
            getElement(
                "bingoPowerupCooldown"
            );


        const cooldownTime =
            getElement(
                "bingoPowerupCooldownTime"
            );


        if (!cup) {

            return;

        }


        const now =
            Date.now();


        /*
            COOLDOWN
        */

        if (
            bingo.brewerCooldownUntil >
            now
        ) {

            const remainingMs =
                bingo.brewerCooldownUntil -
                now;


            const remainingSeconds =
                Math.ceil(
                    remainingMs /
                    1000
                );


            cup.classList.remove(
                "ready",
                "brewing"
            );


            cup.classList.add(
                "cooldown"
            );


            if (fill) {

                fill.style.height =
                    "0%";

            }


            if (timer) {

                timer.textContent =
                    formatCooldown(
                        remainingSeconds
                    );

            }


            if (title) {

                title.textContent =
                    "☕ BREWER COOLING";

            }


            if (text) {

                text.textContent =
                    "The brewer is recharging. You can brew another power-up when the timer reaches zero.";

            }


            if (status) {

                status.classList.remove(
                    "ready"
                );

            }


            if (cooldownBox) {

                cooldownBox.hidden =
                    false;

            }


            if (cooldownTime) {

                cooldownTime.textContent =
                    formatCooldown(
                        remainingSeconds
                    );

            }


            startBrewerCooldownRefresh();

            return;

        }


        /*
            NO COOLDOWN
        */

        if (cooldownBox) {

            cooldownBox.hidden =
                true;

        }


        /*
            READY
        */

        if (
            bingo.brewerReady
        ) {

            cup.classList.remove(
                "brewing",
                "cooldown"
            );


            cup.classList.add(
                "ready"
            );


            if (fill) {

                fill.style.height =
                    "100%";

            }


            if (timer) {

                timer.textContent =
                    "READY";

            }


            if (title) {

                title.textContent =
                    "☕✨ READY — TAP ME!";

            }


            if (text) {

                text.textContent =
                    "A random mystery power-up is waiting.";

            }


            if (status) {

                status.classList.add(
                    "ready"
                );

            }


            return;

        }


        /*
            BREWING
        */

        cup.classList.remove(
            "ready",
            "cooldown"
        );


        cup.classList.add(
            "brewing"
        );


        const progress =
            (
                bingo.brewerDaubs /
                CONFIG.brewerRequiredDaubs
            ) * 100;


        if (fill) {

            fill.style.height =
                `${Math.min(100, progress)}%`;

        }


        if (timer) {

            timer.textContent =
                `${bingo.brewerDaubs}/${CONFIG.brewerRequiredDaubs}`;

        }


        if (title) {

            title.textContent =
                "☕ COFFEE IS BREWING";

        }


        const remaining =
            Math.max(
                0,
                CONFIG.brewerRequiredDaubs -
                bingo.brewerDaubs
            );


        if (text) {

            text.textContent =
                remaining === 0

                    ? "Coffee is ready."

                    : `${remaining} more successful daub${remaining === 1 ? "" : "s"} needed to brew a surprise.`;

        }


        if (status) {

            status.classList.remove(
                "ready"
            );

        }

    }


    function formatCooldown(
        totalSeconds
    ) {

        totalSeconds =
            Math.max(
                0,
                Number(totalSeconds)
            );


        const minutes =
            Math.floor(
                totalSeconds / 60
            );


        const seconds =
            totalSeconds %
            60;


        return (
            `${minutes}:${String(seconds).padStart(2,"0")}`
        );

    }


    function startBrewerCooldownRefresh() {

        if (
            brewerRefreshTimer
        ) {

            return;

        }


        brewerRefreshTimer =
            setInterval(
                () => {

                    if (
                        bingo.brewerCooldownUntil <=
                        Date.now()
                    ) {

                        clearInterval(
                            brewerRefreshTimer
                        );


                        brewerRefreshTimer =
                            null;


                        bingo.brewerCooldownUntil =
                            0;


                        bingo.brewerDaubs =
                            0;


                        bingo.brewerReady =
                            false;


                        updateBingoBrewerUI();


                        showResult(
                            "☕ The brewer has finished recharging. Three successful daubs will brew your next surprise."
                        );


                        return;

                    }


                    updateBingoBrewerUI();

                },
                1000
            );

    }


    /* =====================================================
       27. ACTIVATE BREWER
    ===================================================== */

    function activateBingoPowerUp() {

        if (
            !bingo.gameStarted ||
            bingo.gameOver
        ) {

            return false;

        }


        const now =
            Date.now();


        if (
            bingo.brewerCooldownUntil >
            now
        ) {

            showResult(
                `⏳ The brewer is cooling down. ${formatCooldown(
                    Math.ceil(
                        (
                            bingo.brewerCooldownUntil -
                            now
                        ) / 1000
                    )
                )} remaining.`
            );


            return false;

        }


        if (
            !bingo.brewerReady
        ) {

            const needed =
                Math.max(
                    0,
                    CONFIG.brewerRequiredDaubs -
                    bingo.brewerDaubs
                );


            showResult(
                `☕ The brewer is still brewing. ${needed} more successful daub${needed === 1 ? "" : "s"} needed.`
            );


            return false;

        }


        const powerUp =
            POWER_UPS[
                randomInt(
                    0,
                    POWER_UPS.length - 1
                )
            ];


        const target =
            findRandomPowerUpTarget();


        if (!target) {

            showResult(
                "☕ The brewer could not find a target number."
            );


            return false;

        }


        bingo.currentPowerUp =
            powerUp;


        bingo.powerUpTarget =
            target;


        bingo.brewerReady =
            false;


        bingo.brewerDaubs =
            0;


        bingo.brewerCooldownUntil =
            Date.now() +
            CONFIG.brewerCooldownMs;


        updateBingoBrewerUI();


        /*
            Show the target landing.
        */

        animatePowerUpLanding(
            powerUp,
            target
        );


        showResult(
            `${powerUp.icon} ${powerUp.name} landed on Card ${target.cardIndex + 1} — ${getNumberLabel(target.number)}.`
        );


        startBrewerCooldownRefresh();


        return true;

    }


    /* =====================================================
       28. POWER-UP TARGET CLASS
    ===================================================== */

    function getPowerUpClass(
        id
    ) {

        switch (
            id
        ) {

            case "treasure":
                return "has-treasure";

            case "single-daub":
                return "has-single-daub";

            case "double-daub":
                return "has-double-daub";

            case "instant-bingo":
                return "has-instant-bingo";

            default:
                return "";

        }

    }


    /* =====================================================
       29. POWER-UP LANDING
    ===================================================== */

    function animatePowerUpLanding(
        powerUp,
        target
    ) {

        const cell =
            getDomBingoCell(
                target.cardIndex,
                target.row,
                target.column
            );


        if (!cell) {

            return;

        }


        /*
            Persistent target state.
        */

        cell.classList.add(
            getPowerUpClass(
                powerUp.id
            )
        );


        cell.classList.add(
            "powerup-target"
        );


        cell.dataset.mysteryIcon =
            powerUp.icon;


        /*
            Animated object.
        */

        const landing =
            document.createElement(
                "div"
            );


        landing.className =
            `bingo-powerup-landing powerup-${powerUp.id}`;


        if (
            powerUp.id ===
            "double-daub"
        ) {

            /*
                Attached / overlapping cups.
            */

            landing.innerHTML = `

                <span class="double-coffee">

                    <span class="cup-one">
                        ☕
                    </span>

                    <span class="cup-two">
                        ☕
                    </span>

                </span>

            `;

        }

        else {

            landing.textContent =
                powerUp.icon;

        }


        cell.appendChild(
            landing
        );


        requestAnimationFrame(
            () => {

                landing.classList.add(
                    "landed"
                );

            }
        );


        /*
            Remove ONLY the temporary
            landing animation.

            The target itself stays visible.
        */

        setTimeout(
            () => {

                if (
                    landing.parentNode
                ) {

                    landing.remove();

                }

            },
            2200
        );

    }


    /* =====================================================
       30. RESTORE POWER-UP VISUAL
    ===================================================== */

    function applyPowerUpVisuals() {

        if (
            !bingo.currentPowerUp ||
            !bingo.powerUpTarget
        ) {

            return;

        }


        const target =
            bingo.powerUpTarget;


        const cell =
            getDomBingoCell(
                target.cardIndex,
                target.row,
                target.column
            );


        if (!cell) {

            return;

        }


        cell.classList.add(
            getPowerUpClass(
                bingo.currentPowerUp.id
            )
        );


        cell.classList.add(
            "powerup-target"
        );


        cell.dataset.mysteryIcon =
            bingo.currentPowerUp.icon;

    }


    /* =====================================================
       31. CHECK POWER-UP TARGET
    ===================================================== */

    function checkPowerUpTarget(
        number
    ) {

        if (
            !bingo.currentPowerUp ||
            !bingo.powerUpTarget
        ) {

            return false;

        }


        if (
            bingo.powerUpTarget.number !==
            number
        ) {

            return false;

        }


        const powerUp =
            bingo.currentPowerUp;


        const target =
            bingo.powerUpTarget;


        activatePowerUp(
            powerUp,
            target
        );


        return true;

    }


    /* =====================================================
       32. ACTIVATE POWER-UP
    ===================================================== */

    function activatePowerUp(
        powerUp,
        target
    ) {

        const cell =
            getDomBingoCell(
                target.cardIndex,
                target.row,
                target.column
            );


        if (cell) {

            cell.classList.add(
                "powerup-active"
            );


            setTimeout(
                () => {

                    cell.classList.remove(
                        "powerup-active"
                    );

                },
                1800
            );

        }


        switch (
            powerUp.id
        ) {

            case "treasure":

                activateTreasure(
                    target
                );

                break;


            case "single-daub":

                activateSingleDaub(
                    target
                );

                break;


            case "double-daub":

                activateDoubleDaub(
                    target
                );

                break;


            case "instant-bingo":

                activateInstantBingo(
                    target
                );

                break;

        }


        /*
            Remove persistent target decoration.
        */

        if (cell) {

            cell.classList.remove(
                "has-treasure",
                "has-single-daub",
                "has-double-daub",
                "has-instant-bingo",
                "powerup-target"
            );


            delete cell.dataset.mysteryIcon;

        }


        bingo.currentPowerUp =
            null;


        bingo.powerUpTarget =
            null;

    }


    /* =====================================================
       33. TREASURE
    ===================================================== */

    function activateTreasure(
        target
    ) {

        /*
            75% = credits
            25% = Wild
        */

        if (
            Math.random() < 0.75
        ) {

            const reward =
                randomInt(
                    CONFIG.treasureCoinMin,
                    CONFIG.treasureCoinMax
                );


            addBingoCredits(
                reward
            );


            showResult(
                `🎁 TREASURE! Card ${target.cardIndex + 1} — ${getNumberLabel(target.number)} gave you ${reward} Café Credits!`
            );


            return;

        }


        bingo.wildActive =
            true;


        showResult(
            `🎁 TREASURE! Card ${target.cardIndex + 1} — ${getNumberLabel(target.number)} gave you a WILD! Choose any unmarked number.`
        );


        applyCalledVisuals();

    }


    /* =====================================================
       34. SINGLE DAUB
    ===================================================== */

    function activateSingleDaub(
        target
    ) {

        const success =
            markBingoCell(
                target.cardIndex,
                target.row,
                target.column,
                false
            );


        if (
            success
        ) {

            showResult(
                `☕ SINGLE DAUB! Card ${target.cardIndex + 1} — ${getNumberLabel(target.number)} was daubed for you.`
            );

        }

        else {

            showResult(
                `☕ SINGLE DAUB landed on Card ${target.cardIndex + 1} — ${getNumberLabel(target.number)}.`
            );

        }


        applyCalledVisuals();

        checkBingo();

    }


    /* =====================================================
       35. DOUBLE DAUB
    ===================================================== */

    function activateDoubleDaub(
        target
    ) {

        const success =
            markBingoCell(
                target.cardIndex,
                target.row,
                target.column,
                false
            );


        if (
            success
        ) {

            showResult(
                `☕☕ DOUBLE DAUB! Card ${target.cardIndex + 1} — ${getNumberLabel(target.number)} received a double daub!`
            );

        }

        else {

            showResult(
                `☕☕ DOUBLE DAUB landed on Card ${target.cardIndex + 1} — ${getNumberLabel(target.number)}!`
            );

        }


        applyCalledVisuals();

        checkBingo();

    }


    /* =====================================================
       36. INSTANT BINGO
    ===================================================== */

    function activateInstantBingo(
        target
    ) {

        const reward =
            randomInt(
                CONFIG.instantWinMin,
                CONFIG.instantWinMax
            );


        bingo.gameOver =
            true;


        bingo.wins++;


        bingo.lastWinReward =
            reward;


        addBingoCredits(
            reward
        );


        stopBingoAutoCall();


        showResult(
            `⭐ INSTANT BINGO! Card ${target.cardIndex + 1} — ${getNumberLabel(target.number)} triggered an instant win. You won ${reward} Café Credits!`
        );


        setTimeout(
            () => {

                showBingoWin(
                    `⭐ INSTANT BINGO! Card ${target.cardIndex + 1} won ${reward} Café Credits!`
                );

            },
            900
        );

    }


    /* =====================================================
       37. WILD
    ===================================================== */

    function useBingoWild(
        cardIndex,
        rowIndex,
        columnIndex
    ) {

        if (
            !bingo.wildActive
        ) {

            return false;

        }


        const cell =
            bingo.cards[
                cardIndex
            ]?.[
                rowIndex
            ]?.[
                columnIndex
            ];


        if (
            !cell ||
            cell.free ||
            cell.marked
        ) {

            return false;

        }


        cell.marked =
            true;


        bingo.wildActive =
            false;


        bingo.totalDaubs++;


        const domCell =
            getDomBingoCell(
                cardIndex,
                rowIndex,
                columnIndex
            );


        if (domCell) {

            domCell.classList.add(
                "marked"
            );

            domCell.classList.remove(
                "daubable"
            );

        }


        showResult(
            `🃏 WILD placed on Card ${cardIndex + 1} — ${getNumberLabel(cell.number)}.`
        );


        checkBingo();


        return true;

    }


    /* =====================================================
       38. BINGO CHECK
    ===================================================== */

    function checkBingo() {

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

            const line =
                findWinningLine(
                    bingo.cards[
                        cardIndex
                    ]
                );


            if (!line) {

                continue;

            }


            bingo.gameOver =
                true;


            bingo.wins++;


            const reward =
                randomInt(
                    CONFIG.normalWinMin,
                    CONFIG.normalWinMax
                );


            bingo.lastWinReward =
                reward;


            line.forEach(
                ({
                    row,
                    column
                }) => {

                    const cell =
                        getDomBingoCell(
                            cardIndex,
                            row,
                            column
                        );


                    if (cell) {

                        cell.classList.add(
                            "winning"
                        );

                    }

                }
            );


            addBingoCredits(
                reward
            );


            stopBingoAutoCall();


            showResult(
                `🎉 BINGO! Card ${cardIndex + 1} completed a winning line. You won ${reward} Café Credits!`
            );


            setTimeout(
                () => {

                    showBingoWin(
                        `🎉 BINGO! Card ${cardIndex + 1} won ${reward} Café Credits!`
                    );

                },
                900
            );


            return true;

        }


        return false;

    }


    /* =====================================================
       39. WINNING LINE
    ===================================================== */

    function findWinningLine(
        card
    ) {

        const lines = [];


        /*
            Rows
        */

        for (
            let row = 0;
            row < 5;
            row++
        ) {

            lines.push(
                Array.from(
                    {
                        length: 5
                    },
                    (_, column) => ({
                        row,
                        column
                    })
                )
            );

        }


        /*
            Columns
        */

        for (
            let column = 0;
            column < 5;
            column++
        ) {

            lines.push(
                Array.from(
                    {
                        length: 5
                    },
                    (_, row) => ({
                        row,
                        column
                    })
                )
            );

        }


        /*
            Diagonal
        */

        lines.push([

            {
                row: 0,
                column: 0
            },

            {
                row: 1,
                column: 1
            },

            {
                row: 2,
                column: 2
            },

            {
                row: 3,
                column: 3
            },

            {
                row: 4,
                column: 4
            }

        ]);


        /*
            Reverse diagonal
        */

        lines.push([

            {
                row: 0,
                column: 4
            },

            {
                row: 1,
                column: 3
            },

            {
                row: 2,
                column: 2
            },

            {
                row: 3,
                column: 1
            },

            {
                row: 4,
                column: 0
            }

        ]);


        for (
            const line of lines
        ) {

            const complete =
                line.every(
                    ({
                        row,
                        column
                    }) => {

                        const cell =
                            card[
                                row
                            ][
                                column
                            ];


                        if (
                            cell.free
                        ) {

                            return true;

                        }


                        return cell.marked;

                    }
                );


            if (
                complete
            ) {

                return line;

            }

        }


        return null;

    }


    /* =====================================================
       40. CALLED NUMBERS
    ===================================================== */

    function renderCalledNumbers() {

        const container =
            getElement(
                "bingoCalledNumbers"
            );


        if (!container) {

            return;

        }


        container.innerHTML =
            "";


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


        [
            ...bingo.calledNumbers
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


                    if (
                        number ===
                        bingo.currentNumber
                    ) {

                        item.classList.add(
                            "current"
                        );

                    }


                    item.textContent =
                        getNumberLabel(
                            number
                        );


                    container.appendChild(
                        item
                    );

                }
            );

    }


    /* =====================================================
       41. WIN SCREEN
    ===================================================== */

    function showBingoWin(
        message
    ) {

        const screen =
            getElement(
                "bingoWin"
            );


        if (!screen) {

            return;

        }


        const messageElement =
            getElement(
                "bingoWinMessage"
            );


        const cards =
            getElement(
                "bingoFinalCards"
            );


        const called =
            getElement(
                "bingoFinalCalled"
            );


        const reward =
            getElement(
                "bingoFinalReward"
            );


        if (messageElement) {

            messageElement.textContent =
                message;

        }


        if (cards) {

            cards.textContent =
                bingo.cardCount;

        }


        if (called) {

            called.textContent =
                bingo.calledNumbers.length;

        }


        if (reward) {

            reward.textContent =
                bingo.lastWinReward ||
                bingo.credits;

        }


        screen.hidden =
            false;


        screen.style.display =
            "flex";

    }


    function hideBingoWin() {

        const screen =
            getElement(
                "bingoWin"
            );


        if (!screen) {

            return;

        }


        screen.hidden =
            true;


        screen.style.display =
            "";

    }


    /* =====================================================
       42. AUTO CALL
       -----------------------------------------------------
       Self-scheduling instead of setInterval.
       Prevents multiple timers from stacking.
    ===================================================== */

    function startBingoAutoCall() {

        if (
            bingo.autoCall
        ) {

            return;

        }


        if (
            !bingo.gameStarted
        ) {

            showResult(
                "🎱 Press NEW GAME before starting Auto Call."
            );

            return;

        }


        if (
            bingo.gameOver
        ) {

            showResult(
                "🎱 This game is finished. Start a new game."
            );

            return;

        }


        bingo.autoCall =
            true;


        updateBingoAutoCallButton();


        showResult(
            "🔄 Auto Call is running. The first number is being called now."
        );


        performAutoCallStep();

    }


    function performAutoCallStep() {

        if (
            !bingo.autoCall
        ) {

            return;

        }


        if (
            bingo.gameOver
        ) {

            stopBingoAutoCall();

            return;

        }


        if (
            bingo.calledNumbers.length >=
            CONFIG.totalNumbers
        ) {

            stopBingoAutoCall();


            showResult(
                "📢 All 75 numbers have been called."
            );


            return;

        }


        callBingoNumber();


        if (
            !bingo.autoCall ||
            bingo.gameOver
        ) {

            return;

        }


        bingo.autoCallTimer =
            setTimeout(
                () => {

                    bingo.autoCallTimer =
                        null;

                    performAutoCallStep();

                },
                CONFIG.autoCallInterval
            );

    }


    function stopBingoAutoCall() {

        if (
            bingo.autoCallTimer
        ) {

            clearTimeout(
                bingo.autoCallTimer
            );


            bingo.autoCallTimer =
                null;

        }


        bingo.autoCall =
            false;


        updateBingoAutoCallButton();

    }


    function toggleBingoAutoCall() {

        if (
            bingo.autoCall
        ) {

            stopBingoAutoCall();


            showResult(
                "⏸ Auto Call has been paused."
            );


            return;

        }


        startBingoAutoCall();

    }


    function updateBingoAutoCallButton() {

        const button =
            getElement(
                "bingoAutoCall"
            );


        if (!button) {

            return;

        }


        button.classList.toggle(
            "active",
            bingo.autoCall
        );


        button.setAttribute(
            "aria-pressed",
            String(
                bingo.autoCall
            )
        );

    }


    /* =====================================================
       43. BREWER CLICK
    ===================================================== */

    function handleBrewerInteraction() {

        if (
            !bingo.gameStarted ||
            bingo.gameOver
        ) {

            return;

        }


        const remainingMs =
            bingo.brewerCooldownUntil -
            Date.now();


        if (
            remainingMs > 0
        ) {

            showResult(
                `⏳ The brewer is cooling down. ${formatCooldown(
                    Math.ceil(
                        remainingMs / 1000
                    )
                )} remaining.`
            );


            return;

        }


        if (
            !bingo.brewerReady
        ) {

            const needed =
                Math.max(
                    0,
                    CONFIG.brewerRequiredDaubs -
                    bingo.brewerDaubs
                );


            showResult(
                `☕ The brewer is still brewing. ${needed} more successful daub${needed === 1 ? "" : "s"} needed.`
            );


            return;

        }


        activateBingoPowerUp();

    }


    /* =====================================================
       44. EVENT DELEGATION
    ===================================================== */

    function setupBingoEvents() {

        if (
            bingo.eventsAttached
        ) {

            return;

        }


        bingo.eventsAttached =
            true;


        document.addEventListener(
            "click",
            event => {

                const room =
                    event.target.closest(
                        "#bingoGame"
                    );


                if (!room) {

                    return;

                }


                const cardOption =
                    event.target.closest(
                        "[data-card-count]"
                    );


                if (cardOption) {

                    event.preventDefault();


                    selectBingoCardCount(
                        cardOption.dataset.cardCount
                    );


                    return;

                }


                const daubOption =
                    event.target.closest(
                        "[data-daub-mode]"
                    );


                if (daubOption) {

                    event.preventDefault();


                    setBingoDaubMode(
                        daubOption.dataset.daubMode
                    );


                    return;

                }


                if (
                    event.target.closest(
                        "#bingoCallNumber"
                    )
                ) {

                    event.preventDefault();


                    callBingoNumber();


                    return;

                }


                if (
                    event.target.closest(
                        "#bingoAutoCall"
                    )
                ) {

                    event.preventDefault();


                    toggleBingoAutoCall();


                    return;

                }


                if (
                    event.target.closest(
                        "#bingoNewGame"
                    )
                ) {

                    event.preventDefault();


                    startBingoGame();


                    return;

                }


                if (
                    event.target.closest(
                        "#bingoPlayAgain"
                    )
                ) {

                    event.preventDefault();


                    hideBingoWin();


                    startBingoGame();


                    return;

                }


                const coffee =
                    event.target.closest(
                        "#bingoCoffeeCup"
                    );


                if (coffee) {

                    event.preventDefault();


                    handleBrewerInteraction();


                    return;

                }


                const cell =
                    event.target.closest(
                        ".bingo-cell"
                    );


                if (
                    cell &&
                    !cell.classList.contains(
                        "free"
                    )
                ) {

                    event.preventDefault();


                    daubBingoCell(
                        Number(
                            cell.dataset.cardIndex
                        ),
                        Number(
                            cell.dataset.row
                        ),
                        Number(
                            cell.dataset.column
                        )
                    );

                }

            }
        );


        document.addEventListener(
            "keydown",
            event => {

                const coffee =
                    event.target.closest(
                        "#bingoCoffeeCup"
                    );


                if (!coffee) {

                    return;

                }


                if (
                    event.key === "Enter" ||
                    event.key === " "
                ) {

                    event.preventDefault();


                    handleBrewerInteraction();

                }

            }
        );

    }


    /* =====================================================
       45. PLAYROOM SYNC
    ===================================================== */

    function syncBingoUI() {

        const room =
            getRoom();


        if (!room) {

            return;

        }


        updateCreditsUI();

        updateBingoCardSelectionUI();

        updateBingoStats();

        updateBingoCaller();

        renderCalledNumbers();

        updateBingoBrewerUI();

        updateBingoAutoCallButton();

        applyCalledVisuals();

        applyPowerUpVisuals();

    }


    function scheduleBingoSync() {

        if (
            bingo.syncScheduled
        ) {

            return;

        }


        bingo.syncScheduled =
            true;


        requestAnimationFrame(
            () => {

                bingo.syncScheduled =
                    false;

                syncBingoUI();

            }
        );

    }


    /* =====================================================
       46. PLAYROOM MUTATION OBSERVER
    ===================================================== */

    function setupBingoMutationObserver() {

        if (
            bingo.observerAttached
        ) {

            return;

        }


        if (
            !document.body
        ) {

            return;

        }


        bingo.observerAttached =
            true;


        window.__digicafeBingoObserver =
            new MutationObserver(
                mutations => {

                    let relevant =
                        false;


                    for (
                        const mutation of mutations
                    ) {

                        if (
                            mutation.type !==
                            "childList"
                        ) {

                            continue;

                        }


                        const mutationTarget =
                            mutation.target;


                        if (
                            mutationTarget.closest?.(
                                "#bingoGame"
                            )
                        ) {

                            relevant =
                                true;

                            break;

                        }


                        const nodes = [

                            ...mutation.addedNodes,

                            ...mutation.removedNodes

                        ];


                        if (
                            nodes.some(
                                node =>
                                    node.nodeType === 1 &&
                                    (
                                        node.id ===
                                        "bingoGame" ||

                                        node.querySelector?.(
                                            "#bingoGame"
                                        )
                                    )
                            )
                        ) {

                            relevant =
                                true;

                            break;

                        }

                    }


                    if (
                        relevant
                    ) {

                        scheduleBingoSync();

                    }

                }
            );


        window.__digicafeBingoObserver.observe(
            document.body,
            {
                childList: true,
                subtree: true
            }
        );

    }


    /* =====================================================
       47. INITIALIZATION
    ===================================================== */

    function initBingo() {

        const room =
            getRoom();


        if (!room) {

            console.log(
                "🎱 Bingo waiting for Playroom..."
            );

            return false;

        }


        /*
            Only initialize the game itself once.
        */

        if (
            !bingo.initialized
        ) {

            loadWallet();

            setupBingoEvents();

            setupBingoMutationObserver();


            bingo.initialized =
                true;


            bingo.cardCount =
                1;


            /*
                Automatic first game.
                1 card = 10 credits.
            */

            const started =
                startBingoGame();


            /*
                If player has no credits,
                show a free preview.
            */

            if (
                !started
            ) {

                bingo.gameStarted =
                    false;


                bingo.gameOver =
                    false;


                bingo.calledNumbers =
                    [];


                bingo.currentNumber =
                    null;


                bingo.currentLetter =
                    null;


                bingo.brewerDaubs =
                    0;


                bingo.brewerReady =
                    false;


                generateBingoCards();


                resetBingoCaller();


                showResult(
                    "🎱 Choose your cards and press NEW GAME to play."
                );

            }

        }


        /*
            Render the current cards whenever
            Playroom recreates the Bingo room.
        */

        if (
            bingo.cards.length > 0
        ) {

            renderBingoCards();

        }


        syncBingoUI();


        return true;

    }


    /* =====================================================
       48. BOOT
    ===================================================== */

    function bootDigiCafeBingo() {

        setupBingoMutationObserver();

        initBingo();

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            bootDigiCafeBingo,
            {
                once: true
            }
        );

    }

    else {

        bootDigiCafeBingo();

    }


    /* =====================================================
       49. GLOBAL ACCESS
    ===================================================== */

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


    window.startBingoAutoCall =
        startBingoAutoCall;


    window.stopBingoAutoCall =
        stopBingoAutoCall;


    window.daubBingoCell =
        daubBingoCell;


    window.activateBingoPowerUp =
        activateBingoPowerUp;


    window.resetBingoCredits =
        resetBingoCredits;


    window.addBingoCredits =
        addBingoCredits;


    window.spendBingoCredits =
        spendBingoCredits;


    window.selectBingoCardCount =
        selectBingoCardCount;


    /* =====================================================
       50. DEBUG
    ===================================================== */

    window.debugBingo =
        function () {

            console.table({

                initialized:
                    bingo.initialized,

                gameStarted:
                    bingo.gameStarted,

                gameOver:
                    bingo.gameOver,

                cards:
                    bingo.cards.length,

                cardCount:
                    bingo.cardCount,

                credits:
                    bingo.credits,

                called:
                    bingo.calledNumbers.length,

                remaining:
                    CONFIG.totalNumbers -
                    bingo.calledNumbers.length,

                current:
                    bingo.currentNumber,

                daubMode:
                    bingo.daubMode,

                autoCall:
                    bingo.autoCall,

                brewerProgress:
                    `${bingo.brewerDaubs}/${CONFIG.brewerRequiredDaubs}`,

                brewerReady:
                    bingo.brewerReady,

                brewerCooling:
                    bingo.brewerCooldownUntil >
                    Date.now(),

                brewerTimeRemaining:
                    bingo.brewerCooldownUntil >
                    Date.now()
                        ? formatCooldown(
                            Math.ceil(
                                (
                                    bingo.brewerCooldownUntil -
                                    Date.now()
                                ) / 1000
                            )
                        )
                        : "0:00",

                powerUp:
                    bingo.currentPowerUp?.name ||
                    "none",

                powerUpTarget:
                    bingo.powerUpTarget
                        ? `Card ${bingo.powerUpTarget.cardIndex + 1} — ${getNumberLabel(bingo.powerUpTarget.number)}`
                        : "none",

                wild:
                    bingo.wildActive

            });

        };


    /* =====================================================
       51. LOADED
    ===================================================== */

    console.log(
        "🎱 DigiCafe Bingo — CLEAN COMPLETE ENGINE LOADED ☕"
    );

})();
