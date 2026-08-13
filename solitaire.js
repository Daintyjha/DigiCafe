/* =========================================================
   DIGICAFE SOLITAIRE
   COMPLETE KLONDIKE — DRAW 3
   =========================================================

   FEATURES
   ---------------------------------------------------------
   • Klondike Solitaire
   • Draw 3 stock
   • Waste recycling
   • Tableau → Tableau
   • Tableau → Foundation
   • Waste → Tableau
   • Waste → Foundation
   • Double-click → Foundation
   • Safe automatic foundation moves
   • Automatic card revealing
   • King → empty column
   • Win detection
   • Timer
   • Move counter
   • DigiCafe dynamic room compatible
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

    drag: null,

    /*
        TRUE = Klondike Draw 3
    */
    drawCount: 3,

    /*
        Number of times the stock has been recycled.
    */
    redeals: 0,

    /*
        Optional unlimited redeals.

        Change to a number if you later want
        a limited-redeal version.
    */
    maxRedeals: Infinity,

    /*
        Prevent multiple automatic moves
        from running at the same time.
    */
    autoMoving: false

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
   05. NEW GAME
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


    console.log(
        "🃏 Starting DigiCafe Solitaire..."
    );


    stopSolitaireTimer();


    /* -----------------------------------------------------
       RESET GAME STATE
    ----------------------------------------------------- */

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

    solitaire.drag = null;

    solitaire.redeals = 0;

    solitaire.autoMoving = false;


    /* -----------------------------------------------------
       CREATE DECK
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
       REMAINING CARDS → STOCK
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


    console.log(
        "🃏 Solitaire ready."
    );


    console.log(
        "Draw mode:",
        `Draw ${solitaire.drawCount}`
    );


    console.log(
        "Stock:",
        solitaire.stock.length
    );


    console.log(
        "Tableau:",
        solitaire.tableau.reduce(
            (
                total,
                column
            ) =>
                total +
                column.length,
            0
        )
    );


    return true;

}


/* =========================================================
   06. DEAL TABLEAU
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


            /*
                Only the final card in each
                column begins face-up.
            */

            card.faceUp =
                row === column;


            solitaire.tableau[
                column
            ].push(card);

        }

    }

}


/* =========================================================
   07. TIMER
========================================================= */

function startSolitaireTimer() {

    if (solitaire.started) {

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
   08. STATS
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
   09. FORMAT TIME
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
   10. GET MOVABLE TABLEAU SEQUENCE
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


    /*
        Validate every card after
        the selected card.
    */

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


        const alternatingColor =
            current.color !==
            next.color;


        const descending =
            next.value ===
            current.value - 1;


        if (
            !alternatingColor ||
            !descending
        ) {

            return [];

        }

    }


    return column.slice(
        cardIndex
    );

}


/* =========================================================
   11. FIND CARD
========================================================= */

function findSolitaireCard(
    cardId
) {

    /*
        TABLEAU
    */

    for (
        let column = 0;
        column <
        solitaire.tableau.length;
        column++
    ) {

        const index =
            solitaire.tableau[
                column
            ].findIndex(
                card =>
                    card.id ===
                    cardId
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


    /*
        WASTE

        IMPORTANT:
        Only the LAST waste card
        is playable.
    */

    const wasteIndex =
        solitaire.waste.findIndex(
            card =>
                card.id ===
                cardId
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
   12. CAN MOVE TO TABLEAU
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


    /*
        EMPTY COLUMN

        Only King may be placed
        into an empty tableau.
    */

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


    /*
        Opposite colours.
    */

    if (
        movingCard.color ===
        targetCard.color
    ) {

        return false;

    }


    /*
        Descending by one.
    */

    if (
        movingCard.value !==
        targetCard.value - 1
    ) {

        return false;

    }


    return true;

}


/* =========================================================
   13. CAN MOVE TO FOUNDATION
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


    /*
        EMPTY FOUNDATION

        Only Ace.
    */

    if (
        foundation.length === 0
    ) {

        return (
            card.value === 1
        );

    }


    const topCard =
        foundation[
            foundation.length - 1
        ];


    /*
        Same suit.
    */

    if (
        card.suit !==
        topCard.suit
    ) {

        return false;

    }


    /*
        Exactly one higher.
    */

    if (
        card.value !==
        topCard.value + 1
    ) {

        return false;

    }


    return true;

}


/* =========================================================
   14. GET FOUNDATION INDEX
========================================================= */

function getFoundationIndexForSuit(
    suit
) {

    return solitaireSuits.findIndex(
        item =>
            item.name === suit
    );

}


/* =========================================================
   15. REMOVE SOURCE CARDS
========================================================= */

function removeCardsFromSource(
    source,
    columnIndex,
    cardIndex,
    count
) {

    if (
        source === "tableau"
    ) {

        return solitaire.tableau[
            columnIndex
        ].splice(
            cardIndex,
            count
        );

    }


    if (
        source === "waste"
    ) {

        return solitaire.waste.splice(
            cardIndex,
            count
        );

    }


    return [];

}


/* =========================================================
   16. REVEAL TOP TABLEAU CARD
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


    const topCard =
        column[
            column.length - 1
        ];


    if (
        !topCard.faceUp
    ) {

        topCard.faceUp = true;


        console.log(
            "🃏 Revealed:",
            topCard.rank +
            topCard.symbol
        );


        return true;

    }


    return false;

}


/* =========================================================
   17. MOVE TABLEAU → TABLEAU
========================================================= */

function moveTableauToTableau(
    sourceColumn,
    cardIndex,
    targetColumn
) {

    /*
        Cannot move onto itself.
    */

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

        console.log(
            "❌ Invalid tableau sequence."
        );

        return false;

    }


    if (
        !canMoveToTableau(
            movingCards,
            targetColumn
        )
    ) {

        console.log(
            "❌ Invalid tableau move."
        );

        return false;

    }


    const removed =
        removeCardsFromSource(
            "tableau",
            sourceColumn,
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


    console.log(
        "🃏 Tableau → Tableau"
    );


    return true;

}


/* =========================================================
   18. MOVE TABLEAU → FOUNDATION
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


    /*
        Only the top tableau card
        may enter a foundation.
    */

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


    console.log(
        "🃏 Tableau → Foundation:",
        card.rank +
        card.symbol
    );


    return true;

}


/* =========================================================
   19. MOVE WASTE → TABLEAU
========================================================= */

function moveWasteToTableau(
    targetColumn
) {

    if (
        solitaire.waste.length === 0
    ) {

        return false;

    }


    /*
        ONLY the top waste card
        can be played.
    */

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


    solitaire.waste.pop();


    solitaire.tableau[
        targetColumn
    ].push(
        card
    );


    completeSolitaireMove();


    console.log(
        "🃏 Waste → Tableau:",
        card.rank +
        card.symbol
    );


    return true;

}


/* =========================================================
   20. MOVE WASTE → FOUNDATION
========================================================= */

function moveWasteToFoundation(
    foundationIndex
) {

    if (
        solitaire.waste.length === 0
    ) {

        return false;

    }


    /*
        ONLY top waste card.
    */

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


    solitaire.waste.pop();


    solitaire.foundations[
        foundationIndex
    ].push(
        card
    );


    completeSolitaireMove();


    console.log(
        "🃏 Waste → Foundation:",
        card.rank +
        card.symbol
    );


    return true;

}


/* =========================================================
   21. DRAW THREE CARDS
========================================================= */

function drawFromSolitaireStock() {

    startSolitaireTimer();


    /*
        -----------------------------------------------------
        STOCK HAS CARDS
        -----------------------------------------------------
    */

    if (
        solitaire.stock.length > 0
    ) {

        let drawn = 0;


        /*
            Draw up to THREE cards.
        */

        while (
            drawn <
            solitaire.drawCount &&
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


        /*
            After drawing, check whether
            the exposed waste card can
            safely move to a foundation.
        */

        setTimeout(
            autoMoveSafeCardsToFoundation,
            50
        );


        console.log(
            `🃏 Drew ${drawn} cards.`
        );


        return;

    }


    /*
        -----------------------------------------------------
        STOCK EMPTY
        RECYCLE WASTE
        -----------------------------------------------------
    */

    if (
        solitaire.stock.length === 0 &&
        solitaire.waste.length > 0
    ) {

        /*
            Unlimited redeals for now.
        */

        if (
            solitaire.redeals >=
            solitaire.maxRedeals
        ) {

            console.log(
                "🚫 No more redeals."
            );

            return;

        }


        /*
            Waste order:

            oldest → newest

            [ A, B, C, D ]

            Top playable card is D.

            To recycle correctly, we need
            the stock to produce:

            D → C → B → A

            Since stock uses pop(),
            we put:

            [ D, C, B, A ]

            so A is popped first?

            Actually we want the original
            oldest/newest relationship preserved
            under the Draw-3 model.

            The simplest correct representation
            is to reverse the waste before
            putting it into stock.
        */

        solitaire.stock =
            solitaire.waste.reverse();


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


        console.log(
            "♻️ Waste recycled."
        );


        return;

    }


    console.log(
        "🃏 Nothing left to draw."
    );

}


/* =========================================================
   22. COMPLETE MOVE
========================================================= */

function completeSolitaireMove() {

    startSolitaireTimer();


    solitaire.moves++;


    updateSolitaireStats();


    renderSolitaire();


    /*
        Give the browser a moment to
        render before attempting
        automatic foundation moves.
    */

    setTimeout(
        autoMoveSafeCardsToFoundation,
        30
    );


    checkSolitaireWin();

}


/* =========================================================
   23. AUTO FOUNDATION LOGIC
========================================================= */

/*
    We do NOT blindly move every legal
    card to the foundation.

    That could make a strategic move
    impossible in some games.

    Instead we automatically move:

    • Aces
    • Twos
    • Any card whose foundation move
      is clearly safe

    This makes the game feel natural
    without taking control away from you.
*/

function isSafeFoundationMove(
    card
) {

    if (!card) {

        return false;

    }


    /*
        Aces and Twos are always safe.
    */

    if (
        card.value <= 2
    ) {

        return true;

    }


    /*
        For higher cards, compare
        the opposite-colour suits.

        A card is considered safe when
        both opposite-colour foundation
        suits have reached at least
        two ranks below it.

        Example:

        7♥ can safely move when
        black foundations have progressed
        sufficiently.
    */

    const oppositeSuits =
        solitaireSuits.filter(
            suit =>
                suit.color !==
                card.color
        );


    if (
        oppositeSuits.length !== 2
    ) {

        return false;

    }


    const foundationLevels =
        oppositeSuits.map(
            suit => {

                const index =
                    getFoundationIndexForSuit(
                        suit.name
                    );


                return solitaire
                    .foundations[index]
                    .length;

            }
        );


    const minimumLevel =
        Math.min(
            ...foundationLevels
        );


    return (
        minimumLevel >=
        card.value - 2
    );

}


/* =========================================================
   24. AUTO MOVE TO FOUNDATION
========================================================= */

function autoMoveSafeCardsToFoundation() {

    if (
        solitaire.autoMoving
    ) {

        return;

    }


    solitaire.autoMoving = true;


    let movedSomething = true;


    /*
        Continue looking until there
        are no more safe cards.
    */

    while (
        movedSomething
    ) {

        movedSomething = false;


        /*
            -------------------------------------------------
            CHECK TABLEAU
            -------------------------------------------------
        */

        for (
            let columnIndex = 0;
            columnIndex <
            solitaire.tableau.length;
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
                ) &&
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


                movedSomething = true;


                console.log(
                    "✨ Auto foundation:",
                    card.rank +
                    card.symbol
                );


                break;

            }

        }


        if (
            movedSomething
        ) {

            continue;

        }


        /*
            -------------------------------------------------
            CHECK WASTE
            -------------------------------------------------
        */

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
                ) &&
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


                movedSomething = true;


                console.log(
                    "✨ Auto foundation:",
                    card.rank +
                    card.symbol
                );

            }

        }

    }


    solitaire.autoMoving = false;


    updateSolitaireStats();

    renderSolitaire();


    checkSolitaireWin();

}


/* =========================================================
   25. DOUBLE CLICK → FOUNDATION
========================================================= */

function tryDoubleClickFoundation(
    card
) {

    if (!card) {

        return false;

    }


    const foundationIndex =
        getFoundationIndexForSuit(
            card.suit
        );


    /*
        TABLEAU
    */

    const location =
        findSolitaireCard(
            card.id
        );


    if (!location) {

        return false;

    }


    if (
        location.source ===
        "tableau"
    ) {

        const column =
            solitaire.tableau[
                location.column
            ];


        /*
            Only top card.
        */

        if (
            location.index !==
            column.length - 1
        ) {

            return false;

        }


        /*
            First try normal move.
        */

        if (
            moveTableauToFoundation(
                location.column,
                location.index,
                foundationIndex
            )
        ) {

            return true;

        }

    }


    /*
        WASTE
    */

    if (
        location.source ===
        "waste"
    ) {

        return moveWasteToFoundation(
            foundationIndex
        );

    }


    return false;

}


/* =========================================================
   26. CHECK WIN
========================================================= */

function checkSolitaireWin() {

    const totalCards =
        solitaire.foundations.reduce(
            (
                total,
                foundation
            ) =>
                total +
                foundation.length,
            0
        );


    /*
        All 52 cards are in
        the foundations.
    */

    if (
        totalCards === 52
    ) {

        stopSolitaireTimer();


        console.log(
            "🏆 DigiCafe Solitaire won!"
        );


        showSolitaireWin();


        return true;

    }


    return false;

}


/* =========================================================
   27. SHOW WIN SCREEN
========================================================= */

function showSolitaireWin() {

    const winScreen =
        document.getElementById(
            "solitaireWin"
        );


    if (!winScreen) {

        console.warn(
            "🏆 Solitaire win screen not found."
        );

        return;

    }


    winScreen.hidden = false;

    winScreen.style.display =
        "flex";


    const winMoves =
        document.getElementById(
            "solitaireWinMoves"
        );


    const winTime =
        document.getElementById(
            "solitaireWinTime"
        );


    if (winMoves) {

        winMoves.textContent =
            solitaire.moves;

    }


    if (winTime) {

        winTime.textContent =
            formatSolitaireTime(
                solitaire.seconds
            );

    }

}


/* =========================================================
   28. RENDER GAME
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


    /* =====================================================
       TOP ROW
    ===================================================== */

    const topRow =
        document.createElement(
            "div"
        );


    topRow.className =
        "solitaire-top-row";


    /* =====================================================
       STOCK
    ===================================================== */

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


    /* =====================================================
       WASTE
    ===================================================== */

    const waste =
        createSolitairePile(
            "waste"
        );


    topRow.appendChild(
        waste
    );


    /* =====================================================
       SPACER
    ===================================================== */

    const spacer =
        document.createElement(
            "div"
        );


    spacer.className =
        "solitaire-top-spacer";


    topRow.appendChild(
        spacer
    );


    /* =====================================================
       FOUNDATIONS
    ===================================================== */

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


                solitaire.drag = null;

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


    /* =====================================================
       TABLEAU
    ===================================================== */

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


            /*
                Allow dropping into
                the column itself.
            */

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


                    let moved = false;


                    if (
                        drag.source ===
                        "tableau"
                    ) {

                        moved =
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

                        moved =
                            moveWasteToTableau(
                                columnIndex
                            );

                    }


                    solitaire.drag = null;


                    if (moved) {

                        console.log(
                            "🃏 Move completed."
                        );

                    }

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


/* /* =========================================================
   29. CREATE PILE
========================================================= */

function createSolitairePile(
    type,
    index = null
) {

    const pile =
        document.createElement("div");


    /* =====================================================
       FOUNDATION
    ===================================================== */

    if (type === "foundation") {

        pile.className =
            "solitaire-foundation";

        pile.dataset.foundation =
            index;


        const foundation =
            solitaire.foundations[index];


        if (
            foundation &&
            foundation.length > 0
        ) {

            const card =
                foundation[
                    foundation.length - 1
                ];


            pile.appendChild(
                createSolitaireCardElement(card)
            );

        }


        return pile;

    }


    /* =====================================================
       STOCK / WASTE
    ===================================================== */

    pile.className =
        "solitaire-pile";

    pile.dataset.pile =
        type;


    /* =====================================================
       STOCK
    ===================================================== */

    if (type === "stock") {

        /*
            Show card back while stock
            still contains cards.
        */

        if (solitaire.stock.length > 0) {

            const card =
                solitaire.stock[
                    solitaire.stock.length - 1
                ];


            pile.appendChild(
                createSolitaireCardElement(
                    card,
                    true
                )
            );

        }

        /*
            Empty stock can still be clicked
            to recycle the waste.
        */

        else if (
            solitaire.waste.length > 0
        ) {

            pile.classList.add(
                "solitaire-stock-empty"
            );

        }


        return pile;

    }


    /* =====================================================
       WASTE — DRAW 3
    ===================================================== */

    if (
        type === "waste" &&
        solitaire.waste.length > 0
    ) {

        /*
            Show the last THREE waste cards.

            Example:

            [ 5♣ ][ 9♥ ][ Q♠ ]
                      ↑
                  playable

            The newest card is always
            the rightmost card.
        */

        const visibleCards =
            solitaire.waste.slice(-3);


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
                    Stack the three cards
                    horizontally.
                */

                cardElement.style.position =
                    "absolute";

                cardElement.style.left =
                    `${visibleIndex * 18}px`;

                cardElement.style.top =
                    "0px";


                /*
                    Only the newest / rightmost
                    card is playable.
                */

                const isPlayable =
                    visibleIndex ===
                    visibleCards.length - 1;


                if (isPlayable) {

                    cardElement.classList.add(
                        "solitaire-waste-top"
                    );


                    cardElement.draggable =
                        true;


                    cardElement.addEventListener(
                        "dragstart",
                        event => {

                            solitaire.drag = {

                                source:
                                    "waste",

                                column:
                                    null,

                                index:
                                    solitaire.waste.length - 1,

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

                }

                else {

                    /*
                        The two cards underneath
                        are visible but cannot
                        be dragged.
                    */

                    cardElement.draggable =
                        false;

                }


                pile.appendChild(
                    cardElement
                );

            }
        );

    }


    /*
        IMPORTANT:
        This closes createSolitairePile().
    */

    return pile;

}
/* =========================================================
   30. RENDER TABLEAU COLUMN
========================================================= */

function renderSolitaireColumn(
    columnElement,
    cards
) {

    /*
        Empty tableau.
    */

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


            /*
                Vertical overlap.
            */

            cardElement.style.top =
                `${cardIndex * 30}px`;


            columnElement.appendChild(
                cardElement
            );

        }
    );

}


/* =========================================================
   31. CREATE CARD
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


    /* =====================================================
       FACE DOWN
    ===================================================== */

    if (
        forceBack ||
        !card.faceUp
    ) {

        cardElement.classList.add(
            "solitaire-card-back"
        );


        /*
            Face-down cards are not draggable.
        */

        cardElement.draggable =
            false;


        return cardElement;

    }


    /* =====================================================
       FACE UP
    ===================================================== */

    cardElement.classList.add(
        "solitaire-card-face"
    );


    cardElement.classList.add(

        card.color === "red"

            ? "solitaire-red"

            : "solitaire-black"

    );


    /* =====================================================
       DRAG
    ===================================================== */

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


            /*
                WASTE:
                only top card can move.
            */

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


            /*
                TABLEAU:
                selected card must begin
                a valid sequence.
            */

            if (
                location.source ===
                "tableau"
            ) {

                const sequence =
                    getMovableSequence(
                        location.column,
                        location.index
                    );


                if (
                    sequence.length === 0
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


            console.log(
                "🃏 Dragging:",
                card.rank +
                card.symbol
            );

        }
    );


    cardElement.addEventListener(
        "dragend",
        () => {

            cardElement.classList.remove(
                "solitaire-card-dragging"
            );


            solitaire.drag = null;

        }
    );


    /* =====================================================
       DOUBLE CLICK
       → FOUNDATION
    ===================================================== */

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


    /* =====================================================
       TOP LEFT CORNER
    ===================================================== */

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


    /* =====================================================
       CENTER SYMBOL
    ===================================================== */

    const center =
        document.createElement(
            "div"
        );


    center.className =
        "solitaire-card-center";


    center.textContent =
        card.symbol;


    /* =====================================================
       ADD CONTENT
    ===================================================== */

    cardElement.appendChild(
        corner
    );


    cardElement.appendChild(
        center
    );


    return cardElement;

}


/* =========================================================
   32. CONTROLS
========================================================= */

function setupSolitaireControls() {

    /* =====================================================
       NEW GAME
    ===================================================== */

    const newGame =
        document.getElementById(
            "solitaireNewGame"
        );


    if (
        newGame &&
        !newGame.dataset.solitaireBound
    ) {

        newGame.dataset.solitaireBound =
            "true";


        newGame.addEventListener(
            "click",
            startSolitaireGame
        );

    }


    /* =====================================================
       PLAY AGAIN
    ===================================================== */

    const playAgain =
        document.getElementById(
            "solitairePlayAgain"
        );


    if (
        playAgain &&
        !playAgain.dataset.solitaireBound
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
   33. INITIALIZE
========================================================= */

function initSolitaire() {

    const board =
        document.getElementById(
            "solitaireBoard"
        );


    /*
        Playroom has not loaded yet.
    */

    if (!board) {

        console.log(
            "☕ Solitaire waiting for Playroom..."
        );

        return false;

    }


    console.log(
        "🃏 Initializing DigiCafe Solitaire..."
    );


    setupSolitaireControls();


    /*
        First initialization:
        start a completely new game.
    */

    if (
        !solitaire.initialized
    ) {

        solitaire.initialized =
            true;


        startSolitaireGame();

    }


    /*
        Room was recreated.
    */

    else {

        renderSolitaire();

        setupSolitaireControls();

    }


    return true;

}


/* =========================================================
   34. RESET INITIALIZATION
========================================================= */

function resetSolitaireInitialization() {

    stopSolitaireTimer();


    solitaire.initialized =
        false;


    solitaire.drag =
        null;


    solitaire.autoMoving =
        false;

}


/* =========================================================
   35. GLOBAL ACCESS
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


console.log(
    "🃏 DigiCafe Solitaire engine loaded — Draw 3."
);

