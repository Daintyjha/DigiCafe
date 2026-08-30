/* =========================================================
   DIGICAFE SOLITAIRE
   COMPLETE KLONDIKE — DRAW 3
   ---------------------------------------------------------
   
========================================================= */


/* =========================================================
   01. GAME STATE
========================================================= */

const solitaire = {

    deck: [],

    stock: [],

    waste: [],

    foundations: [
        [],
        [],
        [],
        []
    ],

    tableau: [
        [],
        [],
        [],
        [],
        [],
        [],
        []
    ],

    moves: 0,

    seconds: 0,

    timer: null,

    started: false,

    initialized: false,

    gameOver: false,

    drawCount: 3,

    redeals: 0,

    maxRedeals: Infinity,

    autoMoving: false,

    history: [],

    maxHistory: 100,

    drag: null,

    touchDrag: null

};


/* =========================================================
   02. CARD DATA
========================================================= */

const solitaireSuits = [

    {
        name: "hearts",
        symbol: "♥",
        color: "red"
    },

    {
        name: "diamonds",
        symbol: "♦",
        color: "red"
    },

    {
        name: "clubs",
        symbol: "♣",
        color: "black"
    },

    {
        name: "spades",
        symbol: "♠",
        color: "black"
    }

];


const solitaireRanks = [

    {
        name: "A",
        value: 1
    },

    {
        name: "2",
        value: 2
    },

    {
        name: "3",
        value: 3
    },

    {
        name: "4",
        value: 4
    },

    {
        name: "5",
        value: 5
    },

    {
        name: "6",
        value: 6
    },

    {
        name: "7",
        value: 7
    },

    {
        name: "8",
        value: 8
    },

    {
        name: "9",
        value: 9
    },

    {
        name: "10",
        value: 10
    },

    {
        name: "J",
        value: 11
    },

    {
        name: "Q",
        value: 12
    },

    {
        name: "K",
        value: 13
    }

];


/* =========================================================
   03. CREATE DECK
========================================================= */

function createSolitaireDeck() {

    const deck = [];


    solitaireSuits.forEach(
        suit => {

            solitaireRanks.forEach(
                rank => {

                    deck.push({

                        id:
                            `${suit.name}-${rank.name}`,

                        suit:
                            suit.name,

                        symbol:
                            suit.symbol,

                        color:
                            suit.color,

                        rank:
                            rank.name,

                        value:
                            rank.value,

                        faceUp:
                            false

                    });

                }
            );

        }
    );


    return deck;

}


/* =========================================================
   04. SHUFFLE
========================================================= */

function shuffleSolitaireDeck(
    deck
) {

    for (
        let i = deck.length - 1;
        i > 0;
        i--
    ) {

        const randomIndex =
            Math.floor(
                Math.random() *
                (i + 1)
            );


        [
            deck[i],
            deck[randomIndex]
        ] = [
            deck[randomIndex],
            deck[i]
        ];

    }


    return deck;

}


/* =========================================================
   05. TIMER
========================================================= */

function startSolitaireTimer() {

    if (
        solitaire.started ||
        solitaire.gameOver
    ) {

        return;

    }


    solitaire.started = true;


    solitaire.timer =
        setInterval(
            () => {

                solitaire.seconds++;

                updateSolitaireStats();

            },
            1000
        );

}


function stopSolitaireTimer() {

    if (
        solitaire.timer !== null
    ) {

        clearInterval(
            solitaire.timer
        );

        solitaire.timer = null;

    }

}


/* =========================================================
   06. TIME FORMAT
========================================================= */

function formatSolitaireTime(
    seconds
) {

    const minutes =
        Math.floor(
            seconds / 60
        );


    const remainingSeconds =
        seconds % 60;


    return (

        String(minutes)
            .padStart(2, "0")

        +

        ":" +

        String(
            remainingSeconds
        )
        .padStart(2, "0")

    );

}


/* =========================================================
   07. UPDATE STATS
========================================================= */

function updateSolitaireStats() {

    const moves =
        document.getElementById(
            "solitaireMoves"
        );


    const time =
        document.getElementById(
            "solitaireTime"
        );


    if (moves) {

        moves.textContent =
            solitaire.moves;

    }


    if (time) {

        time.textContent =
            formatSolitaireTime(
                solitaire.seconds
            );

    }

}


/* =========================================================
   08. BOARD HELPERS
========================================================= */

function cloneSolitaireCard(
    card
) {

    return {
        ...card
    };

}


function cloneSolitaireBoard(
    board
) {

    return board.map(
        column =>
            column.map(
                cloneSolitaireCard
            )
    );

}


function getFoundationIndexForSuit(
    suit
) {

    return solitaireSuits.findIndex(
        item =>
            item.name === suit
    );

}


/* =========================================================
   09. NEW GAME
========================================================= */

function startSolitaireGame() {

    const board =
        document.getElementById(
            "solitaireBoard"
        );


    if (!board) {

        console.warn(
            "☕ Solitaire board is not loaded yet."
        );

        return false;

    }


    stopSolitaireTimer();


    solitaire.deck = [];

    solitaire.stock = [];

    solitaire.waste = [];

    solitaire.foundations = [
        [],
        [],
        [],
        []
    ];

    solitaire.tableau = [
        [],
        [],
        [],
        [],
        [],
        [],
        []
    ];

    solitaire.moves = 0;

    solitaire.seconds = 0;

    solitaire.started = false;

    solitaire.gameOver = false;

    solitaire.redeals = 0;

    solitaire.autoMoving = false;

    solitaire.history = [];

    solitaire.drag = null;

    solitaire.touchDrag = null;


    /* -----------------------------------------------------
       CREATE + SHUFFLE
    ----------------------------------------------------- */

    solitaire.deck =
        shuffleSolitaireDeck(
            createSolitaireDeck()
        );


    /* -----------------------------------------------------
       DEAL TABLEAU
    ----------------------------------------------------- */

    dealSolitaireTableau();


    /* -----------------------------------------------------
       REMAINING → STOCK
    ----------------------------------------------------- */

    solitaire.stock =
        solitaire.deck;


    solitaire.deck = [];


    /* -----------------------------------------------------
       HIDE WIN SCREEN
    ----------------------------------------------------- */

    const winScreen =
        document.getElementById(
            "solitaireWin"
        );


    if (winScreen) {

        winScreen.hidden = true;

        winScreen.style.display = "";

    }


    updateSolitaireStats();

    renderSolitaire();

    updateSolitaireUndoButton();


    console.log(
        "🃏 New DigiCafe Solitaire game started."
    );


    return true;

}


/* =========================================================
   10. DEAL TABLEAU
========================================================= */

function dealSolitaireTableau() {

    for (
        let column = 0;
        column < 7;
        column++
    ) {

        for (
            let row = 0;
            row <= column;
            row++
        ) {

            const card =
                solitaire.deck.pop();


            if (!card) {

                console.error(
                    "❌ Not enough cards to deal."
                );

                return;

            }


            card.faceUp =
                row === column;


            solitaire.tableau[
                column
            ].push(
                card
            );

        }

    }

}


/* =========================================================
   11. MOVABLE TABLEAU SEQUENCE
========================================================= */

function getMovableSequence(
    columnIndex,
    cardIndex
) {

    const column =
        solitaire.tableau[
            columnIndex
        ];


    if (!column) {

        return [];

    }


    const selectedCard =
        column[
            cardIndex
        ];


    if (
        !selectedCard ||
        !selectedCard.faceUp
    ) {

        return [];

    }


    for (
        let i = cardIndex;
        i < column.length - 1;
        i++
    ) {

        const current =
            column[i];

        const next =
            column[i + 1];


        if (
            !current.faceUp ||
            !next.faceUp
        ) {

            return [];

        }


        if (
            current.color ===
            next.color
        ) {

            return [];

        }


        if (
            next.value !==
            current.value - 1
        ) {

            return [];

        }

    }


    return column.slice(
        cardIndex
    );

}


/* =========================================================
   12. FIND CARD
========================================================= */

function findSolitaireCard(
    cardId
) {

    for (
        let column = 0;
        column < 7;
        column++
    ) {

        const index =
            solitaire.tableau[
                column
            ].findIndex(
                card =>
                    card.id === cardId
            );


        if (
            index !== -1
        ) {

            return {

                source:
                    "tableau",

                column,

                index,

                card:
                    solitaire.tableau[
                        column
                    ][index]

            };

        }

    }


    const wasteIndex =
        solitaire.waste.findIndex(
            card =>
                card.id === cardId
        );


    if (
        wasteIndex !== -1
    ) {

        return {

            source:
                "waste",

            column:
                null,

            index:
                wasteIndex,

            card:
                solitaire.waste[
                    wasteIndex
                ]

        };

    }


    return null;

}


/* =========================================================
   13. TABLEAU RULES
========================================================= */

function canMoveToTableau(
    movingCards,
    targetColumnIndex
) {

    if (
        !movingCards ||
        movingCards.length === 0
    ) {

        return false;

    }


    const targetColumn =
        solitaire.tableau[
            targetColumnIndex
        ];


    if (!targetColumn) {

        return false;

    }


    const movingCard =
        movingCards[0];


    if (
        targetColumn.length === 0
    ) {

        return (
            movingCard.value === 13
        );

    }


    const targetCard =
        targetColumn[
            targetColumn.length - 1
        ];


    if (
        !targetCard.faceUp
    ) {

        return false;

    }


    return (

        movingCard.color !==
        targetCard.color

        &&

        movingCard.value ===
        targetCard.value - 1

    );

}


/* =========================================================
   14. FOUNDATION RULES
========================================================= */

function canMoveToFoundation(
    card,
    foundationIndex
) {

    if (!card) {

        return false;

    }


    const foundation =
        solitaire.foundations[
            foundationIndex
        ];


    if (!foundation) {

        return false;

    }


    if (
        foundation.length === 0
    ) {

        return card.value === 1;

    }


    const topCard =
        foundation[
            foundation.length - 1
        ];


    return (

        card.suit ===
        topCard.suit

        &&

        card.value ===
        topCard.value + 1

    );

}


/* =========================================================
   15. REVEAL TABLEAU CARD
========================================================= */

function revealTopCard(
    columnIndex
) {

    const column =
        solitaire.tableau[
            columnIndex
        ];


    if (
        !column ||
        column.length === 0
    ) {

        return false;

    }


    const card =
        column[
            column.length - 1
        ];


    if (
        !card.faceUp
    ) {

        card.faceUp = true;

        return true;

    }


    return false;

}


/* =========================================================
   16. UNDO SNAPSHOT
========================================================= */

function saveSolitaireState() {

    const state = {

        stock:
            solitaire.stock.map(
                cloneSolitaireCard
            ),

        waste:
            solitaire.waste.map(
                cloneSolitaireCard
            ),

        foundations:
            solitaire.foundations.map(
                foundation =>
                    foundation.map(
                        cloneSolitaireCard
                    )
            ),

        tableau:
            cloneSolitaireBoard(
                solitaire.tableau
            ),

        moves:
            solitaire.moves,

        seconds:
            solitaire.seconds,

        redeals:
            solitaire.redeals

    };


    solitaire.history.push(
        state
    );


    if (
        solitaire.history.length >
        solitaire.maxHistory
    ) {

        solitaire.history.shift();

    }


    updateSolitaireUndoButton();

}


/* =========================================================
   17. UNDO
========================================================= */

function undoSolitaireMove() {

    if (
        solitaire.history.length === 0
    ) {

        return;

    }


    const state =
        solitaire.history.pop();


    solitaire.stock =
        state.stock.map(
            cloneSolitaireCard
        );


    solitaire.waste =
        state.waste.map(
            cloneSolitaireCard
        );


    solitaire.foundations =
        state.foundations.map(
            foundation =>
                foundation.map(
                    cloneSolitaireCard
                )
        );


    solitaire.tableau =
        cloneSolitaireBoard(
            state.tableau
        );


    solitaire.moves =
        state.moves;

    solitaire.seconds =
        state.seconds;

    solitaire.redeals =
        state.redeals;


    solitaire.gameOver =
        false;


    if (
        solitaire.started &&
        solitaire.timer === null
    ) {

        startSolitaireTimer();

    }


    updateSolitaireStats();

    renderSolitaire();

    updateSolitaireUndoButton();

}


/* =========================================================
   18. UPDATE UNDO BUTTON
========================================================= */

function updateSolitaireUndoButton() {

    const button =
        document.getElementById(
            "solitaireUndo"
        );


    if (!button) {

        return;

    }


    button.disabled =
        solitaire.history.length === 0;

}


/* =========================================================
   19. COMPLETE PLAYER MOVE
========================================================= */

function completeSolitaireMove() {

    startSolitaireTimer();


    solitaire.moves++;


    updateSolitaireStats();

    renderSolitaire();

    updateSolitaireUndoButton();


    setTimeout(
        autoMoveSafeCardsToFoundation,
        35
    );


    checkSolitaireWin();

}


/* =========================================================
   20. TABLEAU → TABLEAU
========================================================= */

function moveTableauToTableau(
    sourceColumn,
    cardIndex,
    targetColumn
) {

    if (
        sourceColumn ===
        targetColumn
    ) {

        return false;

    }


    const movingCards =
        getMovableSequence(
            sourceColumn,
            cardIndex
        );


    if (
        movingCards.length === 0
    ) {

        return false;

    }


    if (
        !canMoveToTableau(
            movingCards,
            targetColumn
        )
    ) {

        return false;

    }


    saveSolitaireState();


    const removed =
        solitaire.tableau[
            sourceColumn
        ].splice(
            cardIndex,
            movingCards.length
        );


    solitaire.tableau[
        targetColumn
    ].push(
        ...removed
    );


    revealTopCard(
        sourceColumn
    );


    completeSolitaireMove();


    return true;

}


/* =========================================================
   21. TABLEAU → FOUNDATION
========================================================= */

function moveTableauToFoundation(
    sourceColumn,
    cardIndex,
    foundationIndex
) {

    const column =
        solitaire.tableau[
            sourceColumn
        ];


    if (!column) {

        return false;

    }


    if (
        cardIndex !==
        column.length - 1
    ) {

        return false;

    }


    const card =
        column[
            cardIndex
        ];


    if (
        !card ||
        !card.faceUp
    ) {

        return false;

    }


    if (
        !canMoveToFoundation(
            card,
            foundationIndex
        )
    ) {

        return false;

    }


    saveSolitaireState();


    column.pop();


    solitaire.foundations[
        foundationIndex
    ].push(
        card
    );


    revealTopCard(
        sourceColumn
    );


    completeSolitaireMove();


    return true;

}


/* =========================================================
   22. WASTE → TABLEAU
========================================================= */

function moveWasteToTableau(
    targetColumn
) {

    if (
        solitaire.waste.length === 0
    ) {

        return false;

    }


    const card =
        solitaire.waste[
            solitaire.waste.length - 1
        ];


    if (
        !card.faceUp
    ) {

        return false;

    }


    if (
        !canMoveToTableau(
            [card],
            targetColumn
        )
    ) {

        return false;

    }


    saveSolitaireState();


    solitaire.waste.pop();


    solitaire.tableau[
        targetColumn
    ].push(
        card
    );


    completeSolitaireMove();


    return true;

}


/* =========================================================
   23. WASTE → FOUNDATION
========================================================= */

function moveWasteToFoundation(
    foundationIndex
) {

    if (
        solitaire.waste.length === 0
    ) {

        return false;

    }


    const card =
        solitaire.waste[
            solitaire.waste.length - 1
        ];


    if (
        !card.faceUp
    ) {

        return false;

    }


    if (
        !canMoveToFoundation(
            card,
            foundationIndex
        )
    ) {

        return false;

    }


    saveSolitaireState();


    solitaire.waste.pop();


    solitaire.foundations[
        foundationIndex
    ].push(
        card
    );


    completeSolitaireMove();


    return true;

}


/* =========================================================
   24. DRAW / RECYCLE
========================================================= */

function drawFromSolitaireStock() {

    if (
        solitaire.gameOver
    ) {

        return;

    }


    startSolitaireTimer();


    /* -----------------------------------------------------
       DRAW
    ----------------------------------------------------- */

    if (
        solitaire.stock.length > 0
    ) {

        saveSolitaireState();


        let drawn = 0;


        while (
            drawn < solitaire.drawCount &&
            solitaire.stock.length > 0
        ) {

            const card =
                solitaire.stock.pop();


            card.faceUp = true;


            solitaire.waste.push(
                card
            );


            drawn++;

        }


        solitaire.moves++;


        updateSolitaireStats();

        renderSolitaire();

        updateSolitaireUndoButton();


        setTimeout(
            autoMoveSafeCardsToFoundation,
            50
        );


        return;

    }


    /* -----------------------------------------------------
       RECYCLE WASTE
    ----------------------------------------------------- */

    if (
        solitaire.waste.length > 0
    ) {

        if (
            solitaire.redeals >=
            solitaire.maxRedeals
        ) {

            return;

        }


        saveSolitaireState();


        /*
            IMPORTANT:

            Waste is stored oldest → newest.

            Current top = last item.

            Stock uses pop().

            Therefore copying the waste
            WITHOUT reversing it gives:

            waste [A,B,C]

            stock [A,B,C]

            pop() → C
            then B
            then A

            which preserves the Draw-3 order.
        */

        solitaire.stock =
            solitaire.waste.map(
                cloneSolitaireCard
            );


        solitaire.waste = [];


        solitaire.stock.forEach(
            card => {

                card.faceUp = false;

            }
        );


        solitaire.redeals++;


        solitaire.moves++;


        updateSolitaireStats();

        renderSolitaire();

        updateSolitaireUndoButton();


        return;

    }

}


/* =========================================================
   25. SAFE FOUNDATION LOGIC
========================================================= */

function isSafeFoundationMove(
    card
) {

    if (!card) {

        return false;

    }


    if (
        card.value <= 2
    ) {

        return true;

    }


    const oppositeSuits =
        solitaireSuits.filter(
            suit =>
                suit.color !==
                card.color
        );


    const levels =
        oppositeSuits.map(
            suit => {

                const index =
                    getFoundationIndexForSuit(
                        suit.name
                    );


                return solitaire
                    .foundations[
                        index
                    ].length;

            }
        );


    return (
        Math.min(
            ...levels
        ) >=
        card.value - 2
    );

}


/* =========================================================
   26. AUTO FOUNDATION
========================================================= */

function autoMoveSafeCardsToFoundation() {

    if (
        solitaire.autoMoving ||
        solitaire.gameOver
    ) {

        return;

    }


    solitaire.autoMoving = true;


    let moved = true;


    while (moved) {

        moved = false;


        /* -------------------------------------------------
           TABLEAU
        ------------------------------------------------- */

        for (
            let columnIndex = 0;
            columnIndex < 7;
            columnIndex++
        ) {

            const column =
                solitaire.tableau[
                    columnIndex
                ];


            if (
                column.length === 0
            ) {

                continue;

            }


            const card =
                column[
                    column.length - 1
                ];


            if (
                !card.faceUp
            ) {

                continue;

            }


            const foundationIndex =
                getFoundationIndexForSuit(
                    card.suit
                );


            if (
                canMoveToFoundation(
                    card,
                    foundationIndex
                )
                &&
                isSafeFoundationMove(
                    card
                )
            ) {

                column.pop();


                solitaire.foundations[
                    foundationIndex
                ].push(
                    card
                );


                revealTopCard(
                    columnIndex
                );


                solitaire.moves++;


                moved = true;


                break;

            }

        }


        if (moved) {

            continue;

        }


        /* -------------------------------------------------
           WASTE
        ------------------------------------------------- */

        if (
            solitaire.waste.length > 0
        ) {

            const card =
                solitaire.waste[
                    solitaire.waste.length - 1
                ];


            const foundationIndex =
                getFoundationIndexForSuit(
                    card.suit
                );


            if (
                canMoveToFoundation(
                    card,
                    foundationIndex
                )
                &&
                isSafeFoundationMove(
                    card
                )
            ) {

                solitaire.waste.pop();


                solitaire.foundations[
                    foundationIndex
                ].push(
                    card
                );


                solitaire.moves++;


                moved = true;

            }

        }

    }


    solitaire.autoMoving = false;


    updateSolitaireStats();

    renderSolitaire();

    updateSolitaireUndoButton();

    checkSolitaireWin();

}


/* =========================================================
   27. DOUBLE CLICK → FOUNDATION
========================================================= */

function tryDoubleClickFoundation(
    card
) {

    if (
        solitaire.gameOver ||
        !card
    ) {

        return false;

    }


    const location =
        findSolitaireCard(
            card.id
        );


    if (!location) {

        return false;

    }


    const foundationIndex =
        getFoundationIndexForSuit(
            card.suit
        );


    if (
        location.source ===
        "tableau"
    ) {

        const column =
            solitaire.tableau[
                location.column
            ];


        if (
            location.index !==
            column.length - 1
        ) {

            return false;

        }


        return moveTableauToFoundation(
            location.column,
            location.index,
            foundationIndex
        );

    }


    if (
        location.source ===
        "waste"
    ) {

        if (
            location.index !==
            solitaire.waste.length - 1
        ) {

            return false;

        }


        return moveWasteToFoundation(
            foundationIndex
        );

    }


    return false;

}


/* =========================================================
   28. WIN
========================================================= */

function checkSolitaireWin() {

    const total =
        solitaire.foundations.reduce(
            (
                sum,
                foundation
            ) =>
                sum +
                foundation.length,
            0
        );


    if (
        total !== 52
    ) {

        return false;

    }


    solitaire.gameOver =
        true;


    stopSolitaireTimer();


    showSolitaireWin();


    return true;

}


/* =========================================================
   29. WIN SCREEN
========================================================= */

function showSolitaireWin() {

    const winScreen =
        document.getElementById(
            "solitaireWin"
        );


    if (!winScreen) {

        return;

    }


    const finalMoves =
        document.getElementById(
            "solitaireFinalMoves"
        );


    const finalTime =
        document.getElementById(
            "solitaireFinalTime"
        );


    if (finalMoves) {

        finalMoves.textContent =
            solitaire.moves;

    }


    if (finalTime) {

        finalTime.textContent =
            formatSolitaireTime(
                solitaire.seconds
            );

    }


    winScreen.hidden =
        false;

    winScreen.style.display =
        "flex";

}


/* =========================================================
   30. RENDER GAME
========================================================= */

function renderSolitaire() {

    const board =
        document.getElementById(
            "solitaireBoard"
        );


    if (!board) {

        return;

    }


    board.innerHTML = "";


    /* -----------------------------------------------------
       TOP ROW
    ----------------------------------------------------- */

    const topRow =
        document.createElement(
            "div"
        );


    topRow.className =
        "solitaire-top-row";


    /* -----------------------------------------------------
       STOCK
    ----------------------------------------------------- */

    const stock =
        createSolitairePile(
            "stock"
        );


    stock.addEventListener(
        "click",
        drawFromSolitaireStock
    );


    topRow.appendChild(
        stock
    );


    /* -----------------------------------------------------
       WASTE
    ----------------------------------------------------- */

    const waste =
        createSolitairePile(
            "waste"
        );


    topRow.appendChild(
        waste
    );


    /* -----------------------------------------------------
       SPACER
    ----------------------------------------------------- */

    const spacer =
        document.createElement(
            "div"
        );


    spacer.className =
        "solitaire-top-spacer";


    topRow.appendChild(
        spacer
    );


    /* -----------------------------------------------------
       FOUNDATIONS
    ----------------------------------------------------- */

    const foundations =
        document.createElement(
            "div"
        );


    foundations.className =
        "solitaire-foundations";


    for (
        let i = 0;
        i < 4;
        i++
    ) {

        const foundation =
            createSolitairePile(
                "foundation",
                i
            );


        foundation.addEventListener(
            "dragover",
            event => {

                event.preventDefault();

            }
        );


        foundation.addEventListener(
            "drop",
            event => {

                event.preventDefault();


                if (
                    !solitaire.drag
                ) {

                    return;

                }


                const drag =
                    solitaire.drag;


                if (
                    drag.source ===
                    "tableau"
                ) {

                    moveTableauToFoundation(
                        drag.column,
                        drag.index,
                        i
                    );

                }


                else if (
                    drag.source ===
                    "waste"
                ) {

                    moveWasteToFoundation(
                        i
                    );

                }


                solitaire.drag =
                    null;

            }
        );


        foundations.appendChild(
            foundation
        );

    }


    topRow.appendChild(
        foundations
    );


    board.appendChild(
        topRow
    );


    /* -----------------------------------------------------
       TABLEAU
    ----------------------------------------------------- */

    const tableau =
        document.createElement(
            "div"
        );


    tableau.className =
        "solitaire-tableau";


    solitaire.tableau.forEach(
        (
            column,
            columnIndex
        ) => {

            const columnElement =
                document.createElement(
                    "div"
                );


            columnElement.className =
                "solitaire-column";


            columnElement.dataset.column =
                columnIndex;


            columnElement.addEventListener(
                "dragover",
                event => {

                    event.preventDefault();

                }
            );


            columnElement.addEventListener(
                "drop",
                event => {

                    event.preventDefault();


                    if (
                        !solitaire.drag
                    ) {

                        return;

                    }


                    const drag =
                        solitaire.drag;


                    if (
                        drag.source ===
                        "tableau"
                    ) {

                        moveTableauToTableau(
                            drag.column,
                            drag.index,
                            columnIndex
                        );

                    }

                    else if (
                        drag.source ===
                        "waste"
                    ) {

                        moveWasteToTableau(
                            columnIndex
                        );

                    }


                    solitaire.drag =
                        null;

                }
            );


            renderSolitaireColumn(
                columnElement,
                column
            );


            tableau.appendChild(
                columnElement
            );

        }
    );


    board.appendChild(
        tableau
    );

}


/* =========================================================
   31. CREATE PILE
========================================================= */

function createSolitairePile(
    type,
    index = null
) {

    const pile =
        document.createElement(
            "div"
        );


    /* -----------------------------------------------------
       FOUNDATION
    ----------------------------------------------------- */

    if (
        type === "foundation"
    ) {

        pile.className =
            "solitaire-foundation";


        pile.dataset.foundation =
            index;


        const foundation =
            solitaire.foundations[
                index
            ];


        if (
            foundation &&
            foundation.length > 0
        ) {

            pile.appendChild(
                createSolitaireCardElement(
                    foundation[
                        foundation.length - 1
                    ]
                )
            );

        }


        return pile;

    }


    /* -----------------------------------------------------
       STOCK / WASTE
    ----------------------------------------------------- */

    pile.className =
        "solitaire-pile";


    pile.dataset.pile =
        type;


    /* -----------------------------------------------------
       STOCK
    ----------------------------------------------------- */

    if (
        type === "stock"
    ) {

        if (
            solitaire.stock.length > 0
        ) {

            pile.appendChild(
                createSolitaireCardElement(
                    solitaire.stock[
                        solitaire.stock.length - 1
                    ],
                    true
                )
            );

        }

        else if (
            solitaire.waste.length > 0
        ) {

            pile.classList.add(
                "solitaire-stock-empty"
            );

        }


        return pile;

    }


    /* -----------------------------------------------------
       WASTE — DRAW 3
    ----------------------------------------------------- */

    if (
        type === "waste"
        &&
        solitaire.waste.length > 0
    ) {

        const visibleCards =
            solitaire.waste.slice(
                -solitaire.drawCount
            );


        visibleCards.forEach(
            (
                card,
                visibleIndex
            ) => {

                const cardElement =
                    createSolitaireCardElement(
                        card
                    );


                /*
                    Position is controlled here,
                    based on actual visible index.

                    This avoids nth-child()
                    problems on mobile.
                */

                cardElement.style.position =
                    "absolute";


                cardElement.style.top =
                    "0";


                cardElement.style.left =
                    `${visibleIndex * 18}px`;


                /*
                    The newest card is always
                    the highest layer.
                */

                cardElement.style.zIndex =
                    String(
                        visibleIndex + 1
                    );


                const isPlayable =
                    visibleIndex ===
                    visibleCards.length - 1;


                if (
                    isPlayable
                ) {

                    cardElement.classList.add(
                        "solitaire-waste-top"
                    );


                    cardElement.style.zIndex =
                        "50";


                    /*
                        Touch handlers are already
                        attached by createCard().
                    */

                    cardElement.draggable =
                        true;

                }

                else {

                    cardElement.draggable =
                        false;

                }


                pile.appendChild(
                    cardElement
                );

            }
        );

    }


    return pile;

}


/* =========================================================
   32. RENDER TABLEAU COLUMN
========================================================= */

function renderSolitaireColumn(
    columnElement,
    cards
) {

    if (
        cards.length === 0
    ) {

        const emptyPile =
            document.createElement(
                "div"
            );


        emptyPile.className =
            "solitaire-pile";


        columnElement.appendChild(
            emptyPile
        );


        return;

    }


    cards.forEach(
        (
            card,
            cardIndex
        ) => {

            const cardElement =
                createSolitaireCardElement(
                    card
                );


            cardElement.style.top =
                `${cardIndex * 30}px`;


            columnElement.appendChild(
                cardElement
            );

        }
    );

}


/* =========================================================
   33. TOUCH DRAG
========================================================= */

function startSolitaireTouch(
    event,
    cardElement,
    card
) {

    if (
        solitaire.touchDrag ||
        !event.touches ||
        event.touches.length !== 1 ||
        solitaire.gameOver
    ) {

        return;

    }


    const location =
        findSolitaireCard(
            card.id
        );


    if (!location) {

        return;

    }


    /* -----------------------------------------------------
       WASTE VALIDATION
    ----------------------------------------------------- */

    if (
        location.source ===
        "waste"
    ) {

        if (
            location.index !==
            solitaire.waste.length - 1
        ) {

            return;

        }

    }


    /* -----------------------------------------------------
       TABLEAU VALIDATION
    ----------------------------------------------------- */

    if (
        location.source ===
        "tableau"
    ) {

        if (
            getMovableSequence(
                location.column,
                location.index
            ).length === 0
        ) {

            return;

        }

    }


    event.preventDefault();


    const touch =
        event.touches[0];


    const rect =
        cardElement.getBoundingClientRect();


    const ghost =
        cardElement.cloneNode(
            true
        );


    ghost.classList.add(
        "solitaire-touch-ghost"
    );


    ghost.style.position =
        "fixed";


    ghost.style.left =
        `${rect.left}px`;


    ghost.style.top =
        `${rect.top}px`;


    ghost.style.width =
        `${rect.width}px`;


    ghost.style.height =
        `${rect.height}px`;


    ghost.style.margin =
        "0";


    ghost.style.pointerEvents =
        "none";


    ghost.style.zIndex =
        "999999";


    document.body.appendChild(
        ghost
    );


    solitaire.touchDrag = {

        card,

        cardElement,

        ghost,

        source:
            location.source,

        column:
            location.column,

        index:
            location.index,

        startX:
            touch.clientX,

        startY:
            touch.clientY,

        offsetX:
            touch.clientX -
            rect.left,

        offsetY:
            touch.clientY -
            rect.top,

        moved:
            false

    };


    cardElement.classList.add(
        "solitaire-card-touching"
    );


    startSolitaireTimer();

}


/* =========================================================
   TOUCH MOVE
========================================================= */

function moveSolitaireTouch(
    event
) {

    const drag =
        solitaire.touchDrag;


    if (
        !drag ||
        !event.touches ||
        event.touches.length !== 1
    ) {

        return;

    }


    const touch =
        event.touches[0];


    const distance =
        Math.hypot(
            touch.clientX -
            drag.startX,
            touch.clientY -
            drag.startY
        );


    if (
        !drag.moved &&
        distance < 8
    ) {

        return;

    }


    event.preventDefault();


    drag.moved =
        true;


    drag.ghost.style.left =
        `${touch.clientX - drag.offsetX}px`;


    drag.ghost.style.top =
        `${touch.clientY - drag.offsetY}px`;


    clearSolitaireTouchTargets();


    drag.ghost.style.display =
        "none";


    const target =
        document.elementFromPoint(
            touch.clientX,
            touch.clientY
        );


    drag.ghost.style.display =
        "";


    if (!target) {

        return;

    }


    const column =
        target.closest(
            ".solitaire-column"
        );


    const foundation =
        target.closest(
            ".solitaire-foundation"
        );


    if (
        column
    ) {

        column.classList.add(
            "solitaire-touch-target"
        );

    }

    else if (
        foundation
    ) {

        foundation.classList.add(
            "solitaire-touch-target"
        );

    }

}


/* =========================================================
   TOUCH END
   ---------------------------------------------------------
   Remove the floating drag ghost BEFORE the game
   re-renders the board.
========================================================= */

function endSolitaireTouch(event) {

    const drag =
        solitaire.touchDrag;


    if (
        !drag ||
        !event.changedTouches ||
        event.changedTouches.length !== 1
    ) {

        cleanupSolitaireTouch();

        return;

    }


    const touch =
        event.changedTouches[0];


    event.preventDefault();


    /*
        Save source information before cleanup.
    */

    const source =
        drag.source;

    const sourceColumn =
        drag.column;

    const sourceIndex =
        drag.index;


    /*
        Hide the ghost while we find the
        actual element underneath the finger.
    */

    if (drag.ghost) {

        drag.ghost.style.display =
            "none";

    }


    const target =
        document.elementFromPoint(
            touch.clientX,
            touch.clientY
        );


    /*
        Determine the destination before
        removing the touch state.
    */

    let targetType =
        null;

    let targetIndex =
        null;


    if (target) {

        const targetColumn =
            target.closest(
                ".solitaire-column"
            );


        const targetFoundation =
            target.closest(
                ".solitaire-foundation"
            );


        if (targetColumn) {

            targetType =
                "tableau";

            targetIndex =
                Number(
                    targetColumn.dataset.column
                );

        }

        else if (targetFoundation) {

            targetType =
                "foundation";

            targetIndex =
                Number(
                    targetFoundation.dataset.foundation
                );

        }

    }


    /*
        IMPORTANT:
        Remove the ghost BEFORE the move.

        renderSolitaire() may immediately rebuild
        the Waste cards.
    */

    cleanupSolitaireTouch();


    let moved =
        false;


    /*
        TABLEAU
    */

    if (
        targetType === "tableau"
    ) {

        if (
            source === "tableau"
        ) {

            moved =
                moveTableauToTableau(
                    sourceColumn,
                    sourceIndex,
                    targetIndex
                );

        }

        else if (
            source === "waste"
        ) {

            moved =
                moveWasteToTableau(
                    targetIndex
                );

        }

    }


    /*
        FOUNDATION
    */

    else if (
        targetType === "foundation"
    ) {

        if (
            source === "tableau"
        ) {

            moved =
                moveTableauToFoundation(
                    sourceColumn,
                    sourceIndex,
                    targetIndex
                );

        }

        else if (
            source === "waste"
        ) {

            moved =
                moveWasteToFoundation(
                    targetIndex
                );

        }

    }


    /*
        Never leave desktop drag state
        behind after a mobile move.
    */

    solitaire.drag =
        null;


    if (moved) {

        console.log(
            "📱 Solitaire touch move completed."
        );

    }

}


/* =========================================================
   TOUCH CANCEL
========================================================= */

function cancelSolitaireTouch() {

    cleanupSolitaireTouch();

}


/* =========================================================
   TOUCH TARGET CLEANUP
========================================================= */

function clearSolitaireTouchTargets() {

    document
        .querySelectorAll(
            ".solitaire-touch-target"
        )
        .forEach(
            element => {

                element.classList.remove(
                    "solitaire-touch-target"
                );

            }
        );

}


/* =========================================================
   TOUCH CLEANUP
========================================================= */

function cleanupSolitaireTouch() {

    const drag =
        solitaire.touchDrag;


    /*
        Remove the floating ghost immediately.
    */

    if (
        drag &&
        drag.ghost
    ) {

        drag.ghost.remove();

        drag.ghost =
            null;

    }


    /*
        Restore the original card.
    */

    if (
        drag &&
        drag.cardElement
    ) {

        drag.cardElement.classList.remove(
            "solitaire-card-touching"
        );

        drag.cardElement.style.opacity =
            "";

    }


    clearSolitaireTouchTargets();


    solitaire.touchDrag =
        null;

}
/* =========================================================
   34. CREATE CARD
========================================================= */

function createSolitaireCardElement(
    card,
    forceBack = false
) {

    const cardElement =
        document.createElement(
            "div"
        );


    cardElement.className =
        "solitaire-card";


    cardElement.dataset.cardId =
        card.id;


    /* -----------------------------------------------------
       FACE DOWN
    ----------------------------------------------------- */

    if (
        forceBack ||
        !card.faceUp
    ) {

        cardElement.classList.add(
            "solitaire-card-back"
        );


        cardElement.draggable =
            false;


        return cardElement;

    }


    /* -----------------------------------------------------
       FACE UP
    ----------------------------------------------------- */

    cardElement.classList.add(
        "solitaire-card-face"
    );


    cardElement.classList.add(
        card.color === "red"
            ? "solitaire-red"
            : "solitaire-black"
    );


    /* -----------------------------------------------------
       DESKTOP DRAG
    ----------------------------------------------------- */

    cardElement.draggable =
        true;


    cardElement.addEventListener(
        "dragstart",
        event => {

            const location =
                findSolitaireCard(
                    card.id
                );


            if (!location) {

                event.preventDefault();

                return;

            }


            if (
                location.source ===
                "waste"
            ) {

                if (
                    location.index !==
                    solitaire.waste.length - 1
                ) {

                    event.preventDefault();

                    return;

                }

            }


            if (
                location.source ===
                "tableau"
            ) {

                if (
                    getMovableSequence(
                        location.column,
                        location.index
                    ).length === 0
                ) {

                    event.preventDefault();

                    return;

                }

            }


            solitaire.drag = {

                source:
                    location.source,

                column:
                    location.column,

                index:
                    location.index,

                card:
                    card

            };


            event.dataTransfer.setData(
                "text/plain",
                card.id
            );


            event.dataTransfer.effectAllowed =
                "move";


            cardElement.classList.add(
                "solitaire-card-dragging"
            );


            startSolitaireTimer();

        }
    );


    cardElement.addEventListener(
        "dragend",
        () => {

            cardElement.classList.remove(
                "solitaire-card-dragging"
            );


            solitaire.drag =
                null;

        }
    );


    /* -----------------------------------------------------
       MOBILE TOUCH
    ----------------------------------------------------- */

    cardElement.addEventListener(
        "touchstart",
        event => {

            startSolitaireTouch(
                event,
                cardElement,
                card
            );

        },
        {
            passive: false
        }
    );


    cardElement.addEventListener(
        "touchmove",
        event => {

            moveSolitaireTouch(
                event
            );

        },
        {
            passive: false
        }
    );


    cardElement.addEventListener(
        "touchend",
        event => {

            endSolitaireTouch(
                event
            );

        },
        {
            passive: false
        }
    );


    cardElement.addEventListener(
        "touchcancel",
        cancelSolitaireTouch,
        {
            passive: false
        }
    );


    /* -----------------------------------------------------
       DOUBLE CLICK
    ----------------------------------------------------- */

    cardElement.addEventListener(
        "dblclick",
        event => {

            event.preventDefault();

            event.stopPropagation();


            tryDoubleClickFoundation(
                card
            );

        }
    );


    /* -----------------------------------------------------
       CARD CORNER
    ----------------------------------------------------- */

    const corner =
        document.createElement(
            "div"
        );


    corner.className =
        "solitaire-card-corner";


    const rank =
        document.createElement(
            "span"
        );


    rank.className =
        "solitaire-card-rank";


    rank.textContent =
        card.rank;


    const suit =
        document.createElement(
            "span"
        );


    suit.className =
        "solitaire-card-suit";


    suit.textContent =
        card.symbol;


    corner.appendChild(
        rank
    );


    corner.appendChild(
        suit
    );


    cardElement.appendChild(
        corner
    );


    /* -----------------------------------------------------
       CENTER SUIT
    ----------------------------------------------------- */

    const center =
        document.createElement(
            "div"
        );


    center.className =
        "solitaire-card-center";


    center.textContent =
        card.symbol;


    cardElement.appendChild(
        center
    );


    return cardElement;

}


/* =========================================================
   35. CONTROLS
========================================================= */

function setupSolitaireControls() {

    const newGame =
        document.getElementById(
            "solitaireNewGame"
        );


    if (
        newGame &&
        newGame.dataset.solitaireBound !== "true"
    ) {

        newGame.dataset.solitaireBound =
            "true";


        newGame.addEventListener(
            "click",
            startSolitaireGame
        );

    }


    const undo =
        document.getElementById(
            "solitaireUndo"
        );


    if (
        undo &&
        undo.dataset.solitaireBound !== "true"
    ) {

        undo.dataset.solitaireBound =
            "true";


        undo.addEventListener(
            "click",
            undoSolitaireMove
        );

    }


    const playAgain =
        document.getElementById(
            "solitairePlayAgain"
        );


    if (
        playAgain &&
        playAgain.dataset.solitaireBound !== "true"
    ) {

        playAgain.dataset.solitaireBound =
            "true";


        playAgain.addEventListener(
            "click",
            startSolitaireGame
        );

    }

}


/* =========================================================
   36. INITIALIZE
========================================================= */

function initSolitaire() {

    const board =
        document.getElementById(
            "solitaireBoard"
        );


    if (!board) {

        console.log(
            "☕ Solitaire waiting for Playroom..."
        );

        return false;

    }


    setupSolitaireControls();


    if (
        !solitaire.initialized
    ) {

        solitaire.initialized =
            true;


        startSolitaireGame();

    }

    else {

        renderSolitaire();

        updateSolitaireStats();

        updateSolitaireUndoButton();

    }


    return true;

}


/* =========================================================
   37. RESET INITIALIZATION
========================================================= */

function resetSolitaireInitialization() {

    stopSolitaireTimer();

    cleanupSolitaireTouch();


    solitaire.initialized =
        false;

    solitaire.started =
        false;

    solitaire.gameOver =
        false;

    solitaire.drag =
        null;

    solitaire.touchDrag =
        null;

}


/* =========================================================
   38. GLOBAL API
========================================================= */

window.solitaire =
    solitaire;


window.initSolitaire =
    initSolitaire;


window.startSolitaireGame =
    startSolitaireGame;


window.resetSolitaireInitialization =
    resetSolitaireInitialization;


window.drawFromSolitaireStock =
    drawFromSolitaireStock;


window.autoMoveSafeCardsToFoundation =
    autoMoveSafeCardsToFoundation;


window.undoSolitaireMove =
    undoSolitaireMove;


console.log(
    "🃏 DigiCafe Solitaire engine loaded — Draw 3."
);
