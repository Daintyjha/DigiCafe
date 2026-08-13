
/* =========================================================
   DIGICAFE DAMA
   ---------------------------------------------------------
   COMPLETE LOCAL 2-PLAYER DAMA / CHECKERS ENGINE

   FEATURES
   ---------------------------------------------------------
   • 8 × 8 board
   • 12 pieces per player
   • Diagonal movement
   • Mandatory captures
   • Multiple captures / jumps
   • King promotion
   • King movement
   • Turn management
   • Captured pieces
   • Move history
   • Undo
   • Resign
   • New Game
   • Play Again
   • Win detection
   • Draw detection
   • Responsive-board compatible
========================================================= */


/* =========================================================
   01. CONFIGURATION
========================================================= */

const damaConfig = {

    boardSize: 8,

    white: "white",

    black: "black",

    startingTurn: "white"

};


/* =========================================================
   02. GAME STATE
========================================================= */

const damaGame = {

    initialized: false,

    playing: false,

    gameOver: false,

    turn: "white",

    board: [],

    selected: null,

    legalMoves: [],

    forcedPiece: null,

    moveHistory: [],

    capturedWhite: [],

    capturedBlack: [],

    lastMove: null,

    result: null

};


/* =========================================================
   03. ELEMENTS
========================================================= */

let damaElements = {};


/* =========================================================
   04. SETUP ELEMENTS
========================================================= */

function setupDamaElements() {

    damaElements = {

        room:
            document.getElementById(
                "damaGame"
            ),

        board:
            document.getElementById(
                "damaBoard"
            ),

        turn:
            document.getElementById(
                "damaTurn"
            ),

        status:
            document.getElementById(
                "damaStatus"
            ),

        whitePlayer:
            document.getElementById(
                "damaWhitePlayer"
            ),

        blackPlayer:
            document.getElementById(
                "damaBlackPlayer"
            ),

        capturedWhite:
            document.getElementById(
                "damaCapturedWhite"
            ),

        capturedBlack:
            document.getElementById(
                "damaCapturedBlack"
            ),

        newGame:
            document.getElementById(
                "damaNewGame"
            ),

        undo:
            document.getElementById(
                "damaUndo"
            ),

        resign:
            document.getElementById(
                "damaResign"
            ),

        moveHistory:
            document.getElementById(
                "damaMoveHistory"
            ),

        moveCount:
            document.getElementById(
                "damaMoveCount"
            ),

        result:
            document.getElementById(
                "damaResult"
            ),

        resultTitle:
            document.getElementById(
                "damaResultTitle"
            ),

        resultMessage:
            document.getElementById(
                "damaResultMessage"
            ),

        resultMoves:
            document.getElementById(
                "damaResultMoves"
            ),

        resultWinner:
            document.getElementById(
                "damaResultWinner"
            ),

        playAgain:
            document.getElementById(
                "damaPlayAgain"
            )

    };


    if (
        !damaElements.board
    ) {

        console.error(
            "🀄 Dama board missing. Expected id=\"damaBoard\"."
        );

        return false;

    }


    return true;

}


/* =========================================================
   05. BOARD HELPERS
========================================================= */

function createEmptyDamaBoard() {

    return Array.from(
        {
            length: 8
        },
        () =>
            Array(8).fill(null)
    );

}


function isDamaInsideBoard(
    row,
    column
) {

    return (
        row >= 0 &&
        row < 8 &&
        column >= 0 &&
        column < 8
    );

}


function damaSquareName(
    row,
    column
) {

    return (
        "abcdefgh"[column] +
        (8 - row)
    );

}


function oppositeDamaColor(
    color
) {

    return (
        color === "white"
            ? "black"
            : "white"
    );

}


/* =========================================================
   06. STARTING POSITION
========================================================= */

function createStartingDamaBoard() {

    const board =
        createEmptyDamaBoard();


    /*
     * BLACK
     */

    for (
        let row = 0;
        row < 3;
        row++
    ) {

        for (
            let column = 0;
            column < 8;
            column++
        ) {

            if (
                (row + column) % 2 === 1
            ) {

                board[row][column] = {

                    color: "black",

                    king: false

                };

            }

        }

    }


    /*
     * WHITE
     */

    for (
        let row = 5;
        row < 8;
        row++
    ) {

        for (
            let column = 0;
            column < 8;
            column++
        ) {

            if (
                (row + column) % 2 === 1
            ) {

                board[row][column] = {

                    color: "white",

                    king: false

                };

            }

        }

    }


    return board;

}


/* =========================================================
   07. CLONE BOARD
========================================================= */

function cloneDamaBoard(
    board
) {

    return board.map(
        row =>
            row.map(
                piece =>
                    piece
                        ? {
                            ...piece
                        }
                        : null
            )
    );

}


/* =========================================================
   08. FIND PIECES
========================================================= */

function getDamaPieces(
    board,
    color
) {

    const pieces = [];


    for (
        let row = 0;
        row < 8;
        row++
    ) {

        for (
            let column = 0;
            column < 8;
            column++
        ) {

            const piece =
                board[row][column];


            if (
                piece &&
                piece.color === color
            ) {

                pieces.push({

                    row,

                    column,

                    piece

                });

            }

        }

    }


    return pieces;

}


/* =========================================================
   09. PIECE DIRECTIONS
========================================================= */

function getDamaDirections(
    piece
) {

    /*
     * Kings move in all four diagonal directions.
     */

    if (
        piece.king
    ) {

        return [

            [-1, -1],
            [-1, 1],
            [1, -1],
            [1, 1]

        ];

    }


    /*
     * Regular pieces move forward.
     */

    if (
        piece.color === "white"
    ) {

        return [

            [-1, -1],
            [-1, 1]

        ];

    }


    return [

        [1, -1],
        [1, 1]

    ];

}


/* =========================================================
   10. RAW SIMPLE MOVES
========================================================= */

function getDamaSimpleMoves(
    board,
    row,
    column
) {

    const piece =
        board[row][column];


    if (!piece) {

        return [];

    }


    const moves = [];


    for (
        const [
            rowOffset,
            columnOffset
        ]
        of getDamaDirections(piece)
    ) {

        const targetRow =
            row + rowOffset;


        const targetColumn =
            column + columnOffset;


        if (
            !isDamaInsideBoard(
                targetRow,
                targetColumn
            )
        ) {

            continue;

        }


        if (
            !board[
                targetRow
            ][
                targetColumn
            ]
        ) {

            moves.push({

                row: targetRow,

                column: targetColumn,

                capture: null

            });

        }

    }


    return moves;

}


/* =========================================================
   11. CAPTURE MOVES
========================================================= */

function getDamaCaptureMoves(
    board,
    row,
    column
) {

    const piece =
        board[row][column];


    if (!piece) {

        return [];

    }


    const moves = [];


    for (
        const [
            rowOffset,
            columnOffset
        ]
        of getDamaDirections(piece)
    ) {

        const middleRow =
            row + rowOffset;


        const middleColumn =
            column + columnOffset;


        const targetRow =
            row + rowOffset * 2;


        const targetColumn =
            column + columnOffset * 2;


        if (
            !isDamaInsideBoard(
                targetRow,
                targetColumn
            )
        ) {

            continue;

        }


        if (
            !isDamaInsideBoard(
                middleRow,
                middleColumn
            )
        ) {

            continue;

        }


        const jumpedPiece =
            board[
                middleRow
            ][
                middleColumn
            ];


        const landingSquare =
            board[
                targetRow
            ][
                targetColumn
            ];


        if (
            jumpedPiece &&
            jumpedPiece.color !== piece.color &&
            !landingSquare
        ) {

            moves.push({

                row: targetRow,

                column: targetColumn,

                capture: {

                    row: middleRow,

                    column: middleColumn

                }

            });

        }

    }


    return moves;

}


/* =========================================================
   12. ALL CAPTURES FOR COLOR
========================================================= */

function getAllDamaCaptures(
    board,
    color
) {

    const captures = [];


    for (
        let row = 0;
        row < 8;
        row++
    ) {

        for (
            let column = 0;
            column < 8;
            column++
        ) {

            const piece =
                board[row][column];


            if (
                !piece ||
                piece.color !== color
            ) {

                continue;

            }


            const moves =
                getDamaCaptureMoves(
                    board,
                    row,
                    column
                );


            moves.forEach(
                move => {

                    captures.push({

                        from: {

                            row,

                            column

                        },

                        to: {

                            row:
                                move.row,

                            column:
                                move.column

                        },

                        capture:
                            move.capture

                    });

                }
            );

        }

    }


    return captures;

}


/* =========================================================
   13. LEGAL MOVES FOR PIECE
========================================================= */

function getDamaLegalMoves(
    board,
    row,
    column
) {

    const piece =
        board[row][column];


    if (!piece) {

        return [];

    }


    const allCaptures =
        getAllDamaCaptures(
            board,
            piece.color
        );


    /*
     * Mandatory capture rule.
     */

    if (
        allCaptures.length > 0
    ) {

        /*
         * If we are continuing
         * a multi-jump, only the
         * forced piece may move.
         */

        if (
            damaGame.forcedPiece &&
            (
                damaGame.forcedPiece.row !== row ||
                damaGame.forcedPiece.column !== column
            )
        ) {

            return [];

        }


        return allCaptures
            .filter(
                move =>
                    move.from.row === row &&
                    move.from.column === column
            )
            .map(
                move => ({

                    row:
                        move.to.row,

                    column:
                        move.to.column,

                    capture:
                        move.capture

                })
            );

    }


    /*
     * During a multi-jump,
     * no normal moves are allowed.
     */

    if (
        damaGame.forcedPiece
    ) {

        return [];

    }


    return getDamaSimpleMoves(
        board,
        row,
        column
    );

}


/* =========================================================
   14. APPLY MOVE
========================================================= */

function applyDamaMove(
    board,
    fromRow,
    fromColumn,
    move
) {

    const newBoard =
        cloneDamaBoard(
            board
        );


    const piece =
        newBoard[
            fromRow
        ][
            fromColumn
        ];


    if (!piece) {

        return {

            board: newBoard,

            captured: null,

            promoted: false

        };

    }


    newBoard[
        fromRow
    ][
        fromColumn
    ] = null;


    let captured =
        null;


    /*
     * Capture
     */

    if (
        move.capture
    ) {

        captured =
            newBoard[
                move.capture.row
            ][
                move.capture.column
            ];


        newBoard[
            move.capture.row
        ][
            move.capture.column
        ] = null;

    }


    /*
     * Promotion
     */

    let promoted =
        false;


    if (
        !piece.king &&
        (
            (
                piece.color === "white" &&
                move.row === 0
            )
            ||
            (
                piece.color === "black" &&
                move.row === 7
            )
        )
    ) {

        piece.king =
            true;

        promoted =
            true;

    }


    newBoard[
        move.row
    ][
        move.column
    ] = piece;


    return {

        board:
            newBoard,

        captured,

        promoted

    };

}


/* =========================================================
   15. CHECK FOR MORE CAPTURES
========================================================= */

function getDamaContinuationCaptures(
    board,
    row,
    column
) {

    return getDamaCaptureMoves(
        board,
        row,
        column
    );

}


/* =========================================================
   16. RENDER BOARD
========================================================= */

function renderDamaBoard() {

    const boardElement =
        damaElements.board;


    if (!boardElement) {

        return;

    }


    boardElement.innerHTML = "";


    for (
        let row = 0;
        row < 8;
        row++
    ) {

        for (
            let column = 0;
            column < 8;
            column++
        ) {

            const square =
                document.createElement(
                    "button"
                );


            square.type =
                "button";


            square.className =
                "dama-square";


            square.dataset.row =
                row;


            square.dataset.column =
                column;


            square.setAttribute(
                "role",
                "gridcell"
            );


            const isLight =
                (
                    row +
                    column
                ) % 2 === 0;


            square.classList.add(
                isLight
                    ? "light"
                    : "dark"
            );


            const piece =
                damaGame.board[
                    row
                ][
                    column
                ];


            /*
             * Piece
             */

            if (piece) {

                const pieceElement =
                    document.createElement(
                        "span"
                    );


                pieceElement.className =
                    "dama-piece";


                pieceElement.classList.add(
                    `dama-piece-${piece.color}`
                );


                if (
                    piece.king
                ) {

                    pieceElement.classList.add(
                        "king"
                    );

                }


                pieceElement.setAttribute(
                    "aria-label",
                    `${piece.color} ${
                        piece.king
                            ? "king"
                            : "piece"
                    }`
                );


                square.appendChild(
                    pieceElement
                );

            }


            /*
             * Selected
             */

            if (
                damaGame.selected &&
                damaGame.selected.row === row &&
                damaGame.selected.column === column
            ) {

                square.classList.add(
                    "selected"
                );

            }


            /*
             * Legal destination
             */

            const legalMove =
                damaGame.legalMoves.find(
                    move =>
                        move.row === row &&
                        move.column === column
                );


            if (
                legalMove
            ) {

                square.classList.add(
                    "legal-move"
                );


                if (
                    legalMove.capture
                ) {

                    square.classList.add(
                        "capture-move"
                    );

                }

            }


            /*
             * Last move
             */

            if (
                damaGame.lastMove &&
                (
                    (
                        damaGame.lastMove.from.row === row &&
                        damaGame.lastMove.from.column === column
                    )
                    ||
                    (
                        damaGame.lastMove.to.row === row &&
                        damaGame.lastMove.to.column === column
                    )
                )
            ) {

                square.classList.add(
                    "last-move"
                );

            }


            square.addEventListener(
                "click",
                () => {

                    handleDamaSquareClick(
                        row,
                        column
                    );

                }
            );


            boardElement.appendChild(
                square
            );

        }

    }

}


/* =========================================================
   17. HANDLE CLICK
========================================================= */

function handleDamaSquareClick(
    row,
    column
) {

    if (
        !damaGame.playing ||
        damaGame.gameOver
    ) {

        return;

    }


    const piece =
        damaGame.board[
            row
        ][
            column
        ];


    /*
     * Destination selected
     */

    const selectedMove =
        damaGame.legalMoves.find(
            move =>
                move.row === row &&
                move.column === column
        );


    if (
        damaGame.selected &&
        selectedMove
    ) {

        executeDamaMove(
            damaGame.selected.row,
            damaGame.selected.column,
            selectedMove
        );


        return;

    }


    /*
     * Select own piece
     */

    if (
        piece &&
        piece.color === damaGame.turn
    ) {

        const moves =
            getDamaLegalMoves(
                damaGame.board,
                row,
                column
            );


        /*
         * If mandatory capture exists
         * but this piece cannot capture,
         * do not select it.
         */

        if (
            moves.length === 0
        ) {

            showDamaStatus(
                "A capture is required."
            );


            return;

        }


        damaGame.selected = {

            row,

            column

        };


        damaGame.legalMoves =
            moves;


        renderDamaBoard();

        return;

    }


    /*
     * Clear selection
     */

    if (
        !damaGame.forcedPiece
    ) {

        damaGame.selected =
            null;

        damaGame.legalMoves =
            [];

        renderDamaBoard();

    }

}


/* =========================================================
   18. MOVE NOTATION
========================================================= */

function createDamaMoveNotation(
    fromRow,
    fromColumn,
    toRow,
    toColumn,
    captured,
    promoted
) {

    const separator =
        captured
            ? "x"
            : "-";


    let notation =
        `${damaSquareName(
            fromRow,
            fromColumn
        )}${separator}${damaSquareName(
            toRow,
            toColumn
        )}`;


    if (
        promoted
    ) {

        notation +=
            "=K";

    }


    return notation;

}


/* =========================================================
   19. EXECUTE MOVE
========================================================= */

function executeDamaMove(
    fromRow,
    fromColumn,
    move
) {

    const piece =
        damaGame.board[
            fromRow
        ][
            fromColumn
        ];


    if (!piece) {

        return;

    }


    /*
     * Save complete state for undo.
     */

    const stateBeforeMove = {

        board:
            cloneDamaBoard(
                damaGame.board
            ),

        turn:
            damaGame.turn,

        selected:
            damaGame.selected
                ? {
                    ...damaGame.selected
                }
                : null,

        forcedPiece:
            damaGame.forcedPiece
                ? {
                    ...damaGame.forcedPiece
                }
                : null,

        lastMove:
            damaGame.lastMove
                ? structuredClone(
                    damaGame.lastMove
                )
                : null,

        capturedWhite:
            [...damaGame.capturedWhite],

        capturedBlack:
            [...damaGame.capturedBlack]

    };


    const result =
        applyDamaMove(
            damaGame.board,
            fromRow,
            fromColumn,
            move
        );


    const notation =
        createDamaMoveNotation(
            fromRow,
            fromColumn,
            move.row,
            move.column,
            result.captured,
            result.promoted
        );


    damaGame.moveHistory.push({

        notation,

        state:
            stateBeforeMove

    });


    /*
     * Captured pieces
     */

    if (
        result.captured
    ) {

        if (
            result.captured.color === "white"
        ) {

            damaGame.capturedBlack.push(
                result.captured
            );

        }

        else {

            damaGame.capturedWhite.push(
                result.captured
            );

        }

    }


    damaGame.board =
        result.board;


    damaGame.lastMove = {

        from: {

            row:
                fromRow,

            column:
                fromColumn

        },

        to: {

            row:
                move.row,

            column:
                move.column

        }

    };


    /*
     * Multiple capture
     */

    if (
        result.captured
    ) {

        const continuation =
            getDamaContinuationCaptures(
                damaGame.board,
                move.row,
                move.column
            );


        if (
            continuation.length > 0 &&
            !result.promoted
        ) {

            /*
             * Same piece must continue jumping.
             */

            damaGame.forcedPiece = {

                row:
                    move.row,

                column:
                    move.column

            };


            damaGame.selected = {

                row:
                    move.row,

                column:
                    move.column

            };


            damaGame.legalMoves =
                continuation;


            renderDamaBoard();

            renderDamaCaptured();

            renderDamaHistory();

            showDamaStatus(
                `${damaGame.turn.toUpperCase()} must continue the capture.`
            );


            updateDamaButtons();

            return;

        }

    }


    /*
     * Complete turn
     */

    damaGame.forcedPiece =
        null;


    damaGame.selected =
        null;


    damaGame.legalMoves =
        [];


    damaGame.turn =
        oppositeDamaColor(
            damaGame.turn
        );


    renderDamaBoard();

    renderDamaCaptured();

    renderDamaHistory();

    updateDamaStatus();


    evaluateDamaGame();

    updateDamaButtons();

}


/* =========================================================
   20. STATUS
========================================================= */

function updateDamaStatus() {

    if (
        damaElements.turn
    ) {

        damaElements.turn.textContent =
            damaGame.turn.toUpperCase();

    }


    if (
        damaGame.gameOver
    ) {

        return;

    }


    const captures =
        getAllDamaCaptures(
            damaGame.board,
            damaGame.turn
        );


    if (
        damaElements.status
    ) {

        if (
            captures.length > 0
        ) {

            damaElements.status.textContent =
                `${damaGame.turn.toUpperCase()} must capture.`;

        }

        else {

            damaElements.status.textContent =
                `${damaGame.turn.toUpperCase()} to move.`;

        }

    }

}


function showDamaStatus(
    message
) {

    if (
        damaElements.status
    ) {

        damaElements.status.textContent =
            message;

    }

}


/* =========================================================
   21. EVALUATE GAME
========================================================= */

function evaluateDamaGame() {

    const color =
        damaGame.turn;


    const pieces =
        getDamaPieces(
            damaGame.board,
            color
        );


    /*
     * No pieces = loss.
     */

    if (
        pieces.length === 0
    ) {

        endDamaGame(
            "win",
            oppositeDamaColor(
                color
            )
        );


        return;

    }


    /*
     * Check whether player
     * has any legal move.
     */

    let hasLegalMove =
        false;


    for (
        const item of pieces
    ) {

        const moves =
            getDamaLegalMoves(
                damaGame.board,
                item.row,
                item.column
            );


        if (
            moves.length > 0
        ) {

            hasLegalMove =
                true;

            break;

        }

    }


    if (
        !hasLegalMove
    ) {

        endDamaGame(
            "win",
            oppositeDamaColor(
                color
            )
        );


        return;

    }


    /*
     * Simple material repetition/draw
     * is intentionally not automatic.
     */

}


/* =========================================================
   22. CAPTURED PIECES
========================================================= */

function renderDamaCaptured() {

    renderDamaCapturedGroup(
        damaElements.capturedWhite,
        damaGame.capturedWhite
    );


    renderDamaCapturedGroup(
        damaElements.capturedBlack,
        damaGame.capturedBlack
    );

}


function renderDamaCapturedGroup(
    container,
    pieces
) {

    if (!container) {

        return;

    }


    container.innerHTML = "";


    pieces.forEach(
        piece => {

            const span =
                document.createElement(
                    "span"
                );


            span.className =
                "dama-captured-piece";


            span.classList.add(
                `dama-piece-${piece.color}`
            );


            if (
                piece.king
            ) {

                span.classList.add(
                    "king"
                );

            }


            span.setAttribute(
                "aria-label",
                `${piece.color} captured piece`
            );


            container.appendChild(
                span
            );

        }
    );

}


/* =========================================================
   23. MOVE HISTORY
========================================================= */

function renderDamaHistory() {

    if (
        !damaElements.moveHistory
    ) {

        return;

    }


    damaElements.moveHistory.innerHTML =
        "";


    if (
        damaGame.moveHistory.length === 0
    ) {

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "dama-history-empty";


        empty.textContent =
            "No moves yet.";


        damaElements.moveHistory.appendChild(
            empty
        );

    }

    else {

        for (
            let i = 0;
            i < damaGame.moveHistory.length;
            i += 2
        ) {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "dama-move-row";


            const number =
                document.createElement(
                    "span"
                );


            number.className =
                "dama-move-number";


            number.textContent =
                `${Math.floor(i / 2) + 1}.`;


            row.appendChild(
                number
            );


            const white =
                document.createElement(
                    "span"
                );


            white.className =
                "dama-move-white";


            white.textContent =
                damaGame.moveHistory[
                    i
                ].notation;


            row.appendChild(
                white
            );


            const black =
                document.createElement(
                    "span"
                );


            black.className =
                "dama-move-black";


            black.textContent =
                damaGame.moveHistory[
                    i + 1
                ]
                    ? damaGame.moveHistory[
                        i + 1
                    ].notation
                    : "—";


            row.appendChild(
                black
            );


            damaElements.moveHistory.appendChild(
                row
            );

        }

    }


    if (
        damaElements.moveCount
    ) {

        damaElements.moveCount.textContent =
            `${damaGame.moveHistory.length} ${
                damaGame.moveHistory.length === 1
                    ? "move"
                    : "moves"
            }`;

    }


    damaElements.moveHistory.scrollTop =
        damaElements.moveHistory.scrollHeight;

}


/* =========================================================
   24. UNDO
========================================================= */

function undoDamaMove() {

    if (
        damaGame.moveHistory.length === 0 ||
        damaGame.gameOver
    ) {

        return;

    }


    /*
     * If a multi-jump was underway,
     * undo the most recent jump.
     */

    const last =
        damaGame.moveHistory.pop();


    if (!last) {

        return;

    }


    damaGame.board =
        cloneDamaBoard(
            last.state.board
        );


    damaGame.turn =
        last.state.turn;


    damaGame.forcedPiece =
        last.state.forcedPiece;


    damaGame.lastMove =
        last.state.lastMove;


    damaGame.capturedWhite =
        [
            ...last.state.capturedWhite
        ];


    damaGame.capturedBlack =
        [
            ...last.state.capturedBlack
        ];


    damaGame.selected =
        null;


    damaGame.legalMoves =
        [];


    renderDamaBoard();

    renderDamaCaptured();

    renderDamaHistory();

    updateDamaStatus();

    updateDamaButtons();

}


/* =========================================================
   25. RESIGN
========================================================= */

function resignDamaGame() {

    if (
        damaGame.gameOver
    ) {

        return;

    }


    const winner =
        oppositeDamaColor(
            damaGame.turn
        );


    endDamaGame(
        "resign",
        winner
    );

}


/* =========================================================
   26. END GAME
========================================================= */

function endDamaGame(
    reason,
    winner
) {

    damaGame.gameOver =
        true;


    damaGame.playing =
        false;


    damaGame.forcedPiece =
        null;


    damaGame.selected =
        null;


    damaGame.legalMoves =
        [];


    damaGame.result = {

        reason,

        winner

    };


    let title =
        "GAME OVER";


    let message =
        "";


    if (
        reason === "win"
    ) {

        title =
            "GAME OVER";


        message =
            `${winner.toUpperCase()} wins the game.`;

    }


    if (
        reason === "resign"
    ) {

        title =
            "RESIGNATION";


        message =
            `${winner.toUpperCase()} wins by resignation.`;

    }


    if (
        damaElements.result
    ) {

        damaElements.result.hidden =
            false;

    }


    if (
        damaElements.resultTitle
    ) {

        damaElements.resultTitle.textContent =
            title;

    }


    if (
        damaElements.resultMessage
    ) {

        damaElements.resultMessage.textContent =
            message;

    }


    if (
        damaElements.resultMoves
    ) {

        damaElements.resultMoves.textContent =
            damaGame.moveHistory.length;

    }


    if (
        damaElements.resultWinner
    ) {

        damaElements.resultWinner.textContent =
            winner
                ? winner.toUpperCase()
                : "DRAW";

    }


    showDamaStatus(
        message
    );


    updateDamaButtons();

}


/* =========================================================
   27. BUTTON STATE
========================================================= */

function updateDamaButtons() {

    if (
        damaElements.undo
    ) {

        damaElements.undo.disabled =
            damaGame.moveHistory.length === 0 ||
            damaGame.gameOver;

    }


    if (
        damaElements.resign
    ) {

        damaElements.resign.disabled =
            !damaGame.playing ||
            damaGame.gameOver;

    }


    if (
        damaElements.newGame
    ) {

        damaElements.newGame.disabled =
            false;

    }

}


/* =========================================================
   28. NEW GAME
========================================================= */

function newDamaGame() {

    damaGame.playing =
        true;


    damaGame.gameOver =
        false;


    damaGame.turn =
        damaConfig.startingTurn;


    damaGame.board =
        createStartingDamaBoard();


    damaGame.selected =
        null;


    damaGame.legalMoves =
        [];


    damaGame.forcedPiece =
        null;


    damaGame.moveHistory =
        [];


    damaGame.capturedWhite =
        [];


    damaGame.capturedBlack =
        [];


    damaGame.lastMove =
        null;


    damaGame.result =
        null;


    if (
        damaElements.result
    ) {

        damaElements.result.hidden =
            true;

    }


    renderDamaBoard();

    renderDamaCaptured();

    renderDamaHistory();

    updateDamaStatus();

    updateDamaButtons();


    console.log(
        "🀄 New DigiCafe Dama game started."
    );

}


/* =========================================================
   29. PLAY AGAIN
========================================================= */

function playDamaAgain() {

    newDamaGame();

}


/* =========================================================
   30. SETUP EVENTS
========================================================= */

function setupDamaEvents() {

    if (
        damaElements.newGame &&
        damaElements.newGame.dataset.damaBound !== "true"
    ) {

        damaElements.newGame.dataset.damaBound =
            "true";


        damaElements.newGame.addEventListener(
            "click",
            newDamaGame
        );

    }


    if (
        damaElements.undo &&
        damaElements.undo.dataset.damaBound !== "true"
    ) {

        damaElements.undo.dataset.damaBound =
            "true";


        damaElements.undo.addEventListener(
            "click",
            undoDamaMove
        );

    }


    if (
        damaElements.resign &&
        damaElements.resign.dataset.damaBound !== "true"
    ) {

        damaElements.resign.dataset.damaBound =
            "true";


        damaElements.resign.addEventListener(
            "click",
            resignDamaGame
        );

    }


    if (
        damaElements.playAgain &&
        damaElements.playAgain.dataset.damaBound !== "true"
    ) {

        damaElements.playAgain.dataset.damaBound =
            "true";


        damaElements.playAgain.addEventListener(
            "click",
            playDamaAgain
        );

    }

}


/* =========================================================
   31. INITIALIZE
========================================================= */

function initDama() {

    const room =
        document.getElementById(
            "damaGame"
        );


    if (!room) {

        console.warn(
            "🀄 Dama room not found."
        );


        return false;

    }


    if (
        damaGame.initialized
    ) {

        renderDamaBoard();

        updateDamaStatus();

        return true;

    }


    console.log(
        "🀄 Initializing DigiCafe Dama..."
    );


    if (
        !setupDamaElements()
    ) {

        return false;

    }


    setupDamaEvents();

    newDamaGame();


    damaGame.initialized =
        true;


    console.log(
        "🀄 DigiCafe Dama ready."
    );


    return true;

}


/* =========================================================
   32. RESET
========================================================= */

function resetDamaInitialization() {

    damaGame.initialized =
        false;


    damaGame.playing =
        false;


    damaGame.gameOver =
        false;


    damaGame.turn =
        "white";


    damaGame.board =
        [];


    damaGame.selected =
        null;


    damaGame.legalMoves =
        [];


    damaGame.forcedPiece =
        null;


    damaGame.moveHistory =
        [];


    damaGame.capturedWhite =
        [];


    damaGame.capturedBlack =
        [];


    damaGame.lastMove =
        null;


    damaGame.result =
        null;

}


/* =========================================================
   33. GLOBAL ACCESS
========================================================= */

window.damaGame =
    damaGame;


window.initDama =
    initDama;


window.newDamaGame =
    newDamaGame;


window.playDamaAgain =
    playDamaAgain;


window.undoDamaMove =
    undoDamaMove;


window.resignDamaGame =
    resignDamaGame;


window.resetDamaInitialization =
    resetDamaInitialization;


console.log(
    "🀄 DigiCafe Dama engine loaded."
);
