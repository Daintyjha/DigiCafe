/* =========================================================
   DIGICAFE CHESS
   ---------------------------------------------------------
   LOCAL 2-PLAYER CHESS ENGINE

   • 8 × 8 board
   • Legal movement
   • Turn management
   • Check / checkmate
   • Stalemate
   • Castling
   • En passant
   • Promotion
   • Captures
   • Move history
   • Undo
   • Resign
   • New Game
   • Play Again
========================================================= */



(() => {

    "use strict";


    /* =====================================================
       PREVENT DUPLICATE INITIALIZATION
    ===================================================== */

    if (window.__DigiCafeChessLoaded) {

        console.warn(
            "♟ DigiCafe Chess is already loaded."
        );

        return;

    }


    window.__DigiCafeChessLoaded = true;


    /* =====================================================
       01. CONFIGURATION
    ===================================================== */

    const chessConfig = {

        boardSize: 8,

        white: "white",

        black: "black",

        startingTurn: "white"

    };


    /* =====================================================
       02. PIECE SYMBOLS
    ===================================================== */

    const chessPieces = {

        white: {

            king: "♔",
            queen: "♕",
            rook: "♖",
            bishop: "♗",
            knight: "♘",
            pawn: "♙"

        },

        black: {

            king: "♚",
            queen: "♛",
            rook: "♜",
            bishop: "♝",
            knight: "♞",
            pawn: "♟"

        }

    };


    /* =====================================================
       03. GAME STATE
    ===================================================== */

    const chessGame = {

        initialized: false,

        playing: false,

        gameOver: false,

        turn: "white",

        board: [],

        selected: null,

        legalMoves: [],

        moveHistory: [],

        capturedWhite: [],

        capturedBlack: [],

        lastMove: null,

        result: null

    };


    /* =====================================================
       04. ELEMENTS
    ===================================================== */

    const chessElements = {

        room: null,

        board: null,

        turn: null,

        status: null,

        whitePlayer: null,

        blackPlayer: null,

        capturedWhite: null,

        capturedBlack: null,

        newGame: null,

        undo: null,

        resign: null,

        moveHistory: null,

        moveCount: null,

        result: null,

        resultTitle: null,

        resultMessage: null,

        resultMoves: null,

        resultWinner: null,

        playAgain: null

    };


    /* =====================================================
       05. SETUP ELEMENTS
    ===================================================== */

    function setupChessElements() {

        chessElements.room =
            document.getElementById("chessGame");

        chessElements.board =
            document.getElementById("chessBoard");

        chessElements.turn =
            document.getElementById("chessTurn");

        chessElements.status =
            document.getElementById("chessStatus");

        chessElements.whitePlayer =
            document.getElementById("chessWhitePlayer");

        chessElements.blackPlayer =
            document.getElementById("chessBlackPlayer");

        chessElements.capturedWhite =
            document.getElementById("chessCapturedWhite");

        chessElements.capturedBlack =
            document.getElementById("chessCapturedBlack");

        chessElements.newGame =
            document.getElementById("chessNewGame");

        chessElements.undo =
            document.getElementById("chessUndo");

        chessElements.resign =
            document.getElementById("chessResign");

        chessElements.moveHistory =
            document.getElementById("chessMoveHistory");

        chessElements.moveCount =
            document.getElementById("chessMoveCount");

        chessElements.result =
            document.getElementById("chessResult");

        chessElements.resultTitle =
            document.getElementById("chessResultTitle");

        chessElements.resultMessage =
            document.getElementById("chessResultMessage");

        chessElements.resultMoves =
            document.getElementById("chessResultMoves");

        chessElements.resultWinner =
            document.getElementById("chessResultWinner");

        chessElements.playAgain =
            document.getElementById("chessPlayAgain");


        if (!chessElements.room) {

            console.warn(
                "♟ #chessGame was not found."
            );

            return false;

        }


        if (!chessElements.board) {

            console.error(
                "♟ #chessBoard was not found."
            );

            return false;

        }


        return true;

    }


    /* =====================================================
       06. EMPTY BOARD
    ===================================================== */

    function createEmptyChessBoard() {

        return Array.from(
            { length: 8 },
            () => Array(8).fill(null)
        );

    }


    /* =====================================================
       07. STARTING POSITION
    ===================================================== */

    function createStartingChessBoard() {

        const board =
            createEmptyChessBoard();


        const backRank = [

            "rook",
            "knight",
            "bishop",
            "queen",
            "king",
            "bishop",
            "knight",
            "rook"

        ];


        /* BLACK */

        for (
            let column = 0;
            column < 8;
            column++
        ) {

            board[0][column] = {

                type: backRank[column],

                color: "black",

                hasMoved: false

            };


            board[1][column] = {

                type: "pawn",

                color: "black",

                hasMoved: false

            };

        }


        /* WHITE */

        for (
            let column = 0;
            column < 8;
            column++
        ) {

            board[6][column] = {

                type: "pawn",

                color: "white",

                hasMoved: false

            };


            board[7][column] = {

                type: backRank[column],

                color: "white",

                hasMoved: false

            };

        }


        return board;

    }


    /* =====================================================
       08. CLONE BOARD
    ===================================================== */

    function cloneChessBoard(board) {

        return board.map(
            row =>
                row.map(
                    piece =>
                        piece
                            ? { ...piece }
                            : null
                )
        );

    }


    /* =====================================================
       09. BOARD HELPERS
    ===================================================== */

    function isChessInsideBoard(row, column) {

        return (

            row >= 0 &&
            row < 8 &&
            column >= 0 &&
            column < 8

        );

    }


    function chessSquareName(row, column) {

        return (
            "abcdefgh"[column] +
            (8 - row)
        );

    }


    function oppositeChessColor(color) {

        return color === "white"
            ? "black"
            : "white";

    }


    /* =====================================================
       10. FIND KING
    ===================================================== */

    function findChessKing(board, color) {

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
                    piece.color === color &&
                    piece.type === "king"

                ) {

                    return {
                        row,
                        column
                    };

                }

            }

        }


        return null;

    }


    /* =====================================================
       11. ATTACK DETECTION
    ===================================================== */

    function isChessSquareAttacked(
        board,
        row,
        column,
        byColor
    ) {

        /* PAWNS */

        const pawnDirection =
            byColor === "white"
                ? -1
                : 1;


        const pawnRow =
            row - pawnDirection;


        for (
            const pawnColumn of [
                column - 1,
                column + 1
            ]
        ) {

            if (
                !isChessInsideBoard(
                    pawnRow,
                    pawnColumn
                )
            ) {

                continue;

            }


            const piece =
                board[pawnRow][pawnColumn];


            if (

                piece &&
                piece.color === byColor &&
                piece.type === "pawn"

            ) {

                return true;

            }

        }


        /* KNIGHTS */

        const knightOffsets = [

            [-2, -1],
            [-2, 1],
            [-1, -2],
            [-1, 2],
            [1, -2],
            [1, 2],
            [2, -1],
            [2, 1]

        ];


        for (
            const [
                rowOffset,
                columnOffset
            ] of knightOffsets
        ) {

            const targetRow =
                row + rowOffset;

            const targetColumn =
                column + columnOffset;


            if (
                !isChessInsideBoard(
                    targetRow,
                    targetColumn
                )
            ) {

                continue;

            }


            const piece =
                board[targetRow][targetColumn];


            if (

                piece &&
                piece.color === byColor &&
                piece.type === "knight"

            ) {

                return true;

            }

        }


        /* KING */

        for (
            let rowOffset = -1;
            rowOffset <= 1;
            rowOffset++
        ) {

            for (
                let columnOffset = -1;
                columnOffset <= 1;
                columnOffset++
            ) {

                if (
                    rowOffset === 0 &&
                    columnOffset === 0
                ) {

                    continue;

                }


                const targetRow =
                    row + rowOffset;

                const targetColumn =
                    column + columnOffset;


                if (
                    !isChessInsideBoard(
                        targetRow,
                        targetColumn
                    )
                ) {

                    continue;

                }


                const piece =
                    board[targetRow][targetColumn];


                if (

                    piece &&
                    piece.color === byColor &&
                    piece.type === "king"

                ) {

                    return true;

                }

            }

        }


        /* ROOK / QUEEN */

        const rookDirections = [

            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1]

        ];


        for (
            const [
                rowOffset,
                columnOffset
            ] of rookDirections
        ) {

            let targetRow =
                row + rowOffset;

            let targetColumn =
                column + columnOffset;


            while (
                isChessInsideBoard(
                    targetRow,
                    targetColumn
                )
            ) {

                const piece =
                    board[targetRow][targetColumn];


                if (piece) {

                    if (

                        piece.color === byColor &&
                        (
                            piece.type === "rook" ||
                            piece.type === "queen"
                        )

                    ) {

                        return true;

                    }


                    break;

                }


                targetRow += rowOffset;

                targetColumn += columnOffset;

            }

        }


        /* BISHOP / QUEEN */

        const bishopDirections = [

            [-1, -1],
            [-1, 1],
            [1, -1],
            [1, 1]

        ];


        for (
            const [
                rowOffset,
                columnOffset
            ] of bishopDirections
        ) {

            let targetRow =
                row + rowOffset;

            let targetColumn =
                column + columnOffset;


            while (
                isChessInsideBoard(
                    targetRow,
                    targetColumn
                )
            ) {

                const piece =
                    board[targetRow][targetColumn];


                if (piece) {

                    if (

                        piece.color === byColor &&
                        (
                            piece.type === "bishop" ||
                            piece.type === "queen"
                        )

                    ) {

                        return true;

                    }


                    break;

                }


                targetRow += rowOffset;

                targetColumn += columnOffset;

            }

        }


        return false;

    }


    /* =====================================================
       12. CHECK
    ===================================================== */

    function isChessInCheck(board, color) {

        const king =
            findChessKing(
                board,
                color
            );


        if (!king) {

            return true;

        }


        return isChessSquareAttacked(

            board,

            king.row,

            king.column,

            oppositeChessColor(color)

        );

    }


    /* =====================================================
       13. SLIDING MOVES
    ===================================================== */

    function addSlidingMoves(
        board,
        row,
        column,
        piece,
        vectors,
        moves
    ) {

        for (
            const [
                rowOffset,
                columnOffset
            ] of vectors
        ) {

            let targetRow =
                row + rowOffset;

            let targetColumn =
                column + columnOffset;


            while (
                isChessInsideBoard(
                    targetRow,
                    targetColumn
                )
            ) {

                const target =
                    board[targetRow][targetColumn];


                if (!target) {

                    moves.push({

                        row: targetRow,
                        column: targetColumn

                    });

                }

                else {

                    if (

                        target.color !== piece.color &&
                        target.type !== "king"

                    ) {

                        moves.push({

                            row: targetRow,
                            column: targetColumn

                        });

                    }


                    break;

                }


                targetRow += rowOffset;

                targetColumn += columnOffset;

            }

        }

    }


    /* =====================================================
       14. RAW MOVES
    ===================================================== */

    function getRawChessMoves(
        board,
        row,
        column,
        includeCastling = true
    ) {

        const piece =
            board[row][column];


        if (!piece) {

            return [];

        }


        const moves = [];


        function addMove(
            targetRow,
            targetColumn,
            extra = {}
        ) {

            if (
                !isChessInsideBoard(
                    targetRow,
                    targetColumn
                )
            ) {

                return;

            }


            const target =
                board[targetRow][targetColumn];


            if (
                target &&
                target.color === piece.color
            ) {

                return;

            }


            if (
                target &&
                target.type === "king"
            ) {

                return;

            }


            moves.push({

                row: targetRow,

                column: targetColumn,

                ...extra

            });

        }


        /* PAWN */

        if (
            piece.type === "pawn"
        ) {

            const direction =
                piece.color === "white"
                    ? -1
                    : 1;


            const startRow =
                piece.color === "white"
                    ? 6
                    : 1;


            const oneRow =
                row + direction;


            if (

                isChessInsideBoard(
                    oneRow,
                    column
                ) &&
                !board[oneRow][column]

            ) {

                moves.push({

                    row: oneRow,

                    column,

                    promotion:
                        oneRow === 0 ||
                        oneRow === 7

                });


                const twoRow =
                    row + direction * 2;


                if (

                    row === startRow &&
                    !board[twoRow][column]

                ) {

                    moves.push({

                        row: twoRow,

                        column,

                        pawnDouble: true

                    });

                }

            }


            /* PAWN CAPTURE */

            for (
                const columnOffset of [-1, 1]
            ) {

                const targetRow =
                    row + direction;

                const targetColumn =
                    column + columnOffset;


                if (
                    !isChessInsideBoard(
                        targetRow,
                        targetColumn
                    )
                ) {

                    continue;

                }


                const target =
                    board[targetRow][targetColumn];


                if (

                    target &&
                    target.color !== piece.color &&
                    target.type !== "king"

                ) {

                    moves.push({

                        row: targetRow,

                        column: targetColumn,

                        promotion:
                            targetRow === 0 ||
                            targetRow === 7

                    });

                }

            }


            /* EN PASSANT */

            if (
                chessGame.lastMove &&
                chessGame.lastMove.piece &&
                chessGame.lastMove.piece.type === "pawn"
            ) {

                const last =
                    chessGame.lastMove;


                if (

                    Math.abs(
                        last.from.row -
                        last.to.row
                    ) === 2 &&

                    last.to.row === row &&

                    Math.abs(
                        last.to.column -
                        column
                    ) === 1

                ) {

                    moves.push({

                        row:
                            row + direction,

                        column:
                            last.to.column,

                        enPassant: true

                    });

                }

            }


            return moves;

        }


        /* KNIGHT */

        if (
            piece.type === "knight"
        ) {

            const offsets = [

                [-2, -1],
                [-2, 1],
                [-1, -2],
                [-1, 2],
                [1, -2],
                [1, 2],
                [2, -1],
                [2, 1]

            ];


            for (
                const [
                    rowOffset,
                    columnOffset
                ] of offsets
            ) {

                addMove(

                    row + rowOffset,

                    column + columnOffset

                );

            }


            return moves;

        }


        /* BISHOP */

        if (
            piece.type === "bishop"
        ) {

            addSlidingMoves(

                board,
                row,
                column,
                piece,

                [
                    [-1, -1],
                    [-1, 1],
                    [1, -1],
                    [1, 1]
                ],

                moves

            );


            return moves;

        }


        /* ROOK */

        if (
            piece.type === "rook"
        ) {

            addSlidingMoves(

                board,
                row,
                column,
                piece,

                [
                    [-1, 0],
                    [1, 0],
                    [0, -1],
                    [0, 1]
                ],

                moves

            );


            return moves;

        }


        /* QUEEN */

        if (
            piece.type === "queen"
        ) {

            addSlidingMoves(

                board,
                row,
                column,
                piece,

                [
                    [-1, 0],
                    [1, 0],
                    [0, -1],
                    [0, 1],
                    [-1, -1],
                    [-1, 1],
                    [1, -1],
                    [1, 1]
                ],

                moves

            );


            return moves;

        }


        /* KING */

        if (
            piece.type === "king"
        ) {

            for (
                let rowOffset = -1;
                rowOffset <= 1;
                rowOffset++
            ) {

                for (
                    let columnOffset = -1;
                    columnOffset <= 1;
                    columnOffset++
                ) {

                    if (

                        rowOffset === 0 &&
                        columnOffset === 0

                    ) {

                        continue;

                    }


                    addMove(

                        row + rowOffset,

                        column + columnOffset

                    );

                }

            }


            /* CASTLING */

            if (

                includeCastling &&

                !piece.hasMoved &&

                !isChessInCheck(
                    board,
                    piece.color
                )

            ) {

                const enemy =
                    oppositeChessColor(
                        piece.color
                    );


                /* KING SIDE */

                const kingRook =
                    board[row][7];


                if (

                    kingRook &&
                    kingRook.type === "rook" &&
                    kingRook.color === piece.color &&
                    !kingRook.hasMoved &&
                    !board[row][5] &&
                    !board[row][6] &&
                    !isChessSquareAttacked(
                        board,
                        row,
                        5,
                        enemy
                    ) &&
                    !isChessSquareAttacked(
                        board,
                        row,
                        6,
                        enemy
                    )

                ) {

                    moves.push({

                        row,

                        column: 6,

                        castle: "king"

                    });

                }


                /* QUEEN SIDE */

                const queenRook =
                    board[row][0];


                if (

                    queenRook &&
                    queenRook.type === "rook" &&
                    queenRook.color === piece.color &&
                    !queenRook.hasMoved &&
                    !board[row][1] &&
                    !board[row][2] &&
                    !board[row][3] &&
                    !isChessSquareAttacked(
                        board,
                        row,
                        3,
                        enemy
                    ) &&
                    !isChessSquareAttacked(
                        board,
                        row,
                        2,
                        enemy
                    )

                ) {

                    moves.push({

                        row,

                        column: 2,

                        castle: "queen"

                    });

                }

            }


            return moves;

        }


        return moves;

    }


    /* =====================================================
       15. SIMULATE MOVE
    ===================================================== */

    function simulateChessMove(
        board,
        fromRow,
        fromColumn,
        move
    ) {

        const newBoard =
            cloneChessBoard(board);


        const piece =
            newBoard[fromRow][fromColumn];


        if (!piece) {

            return newBoard;

        }


        newBoard[fromRow][fromColumn] =
            null;


        /* EN PASSANT */

        if (
            move.enPassant
        ) {

            const captureRow =
                piece.color === "white"
                    ? move.row + 1
                    : move.row - 1;


            newBoard[captureRow][move.column] =
                null;

        }


        /* MOVE */

        piece.hasMoved =
            true;


        /* PROMOTION */

        if (
            move.promotion
        ) {

            piece.type =
                "queen";

        }


        newBoard[move.row][move.column] =
            piece;


        /* CASTLING */

        if (
            move.castle === "king"
        ) {

            const rook =
                newBoard[fromRow][7];


            newBoard[fromRow][7] =
                null;


            if (rook) {

                rook.hasMoved =
                    true;

                newBoard[fromRow][5] =
                    rook;

            }

        }


        if (
            move.castle === "queen"
        ) {

            const rook =
                newBoard[fromRow][0];


            newBoard[fromRow][0] =
                null;


            if (rook) {

                rook.hasMoved =
                    true;

                newBoard[fromRow][3] =
                    rook;

            }

        }


        return newBoard;

    }


    /* =====================================================
       16. LEGAL MOVES
    ===================================================== */

    function getChessLegalMoves(
        board,
        row,
        column
    ) {

        const piece =
            board[row][column];


        if (!piece) {

            return [];

        }


        const rawMoves =
            getRawChessMoves(
                board,
                row,
                column,
                true
            );


        return rawMoves.filter(
            move => {

                const simulated =
                    simulateChessMove(
                        board,
                        row,
                        column,
                        move
                    );


                return !isChessInCheck(
                    simulated,
                    piece.color
                );

            }
        );

    }


    /* =====================================================
       17. ALL LEGAL MOVES
    ===================================================== */

    function getAllChessLegalMoves(
        board,
        color
    ) {

        const allMoves = [];


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
                    getChessLegalMoves(
                        board,
                        row,
                        column
                    );


                for (
                    const move of moves
                ) {

                    allMoves.push({

                        from: {
                            row,
                            column
                        },

                        to: {
                            row: move.row,
                            column: move.column
                        },

                        ...move

                    });

                }

            }

        }


        return allMoves;

    }


    /* =====================================================
       18. RENDER BOARD
    ===================================================== */

    function renderChessBoard() {

        const boardElement =
            chessElements.board;


        if (!boardElement) {

            return;

        }


        boardElement.innerHTML =
            "";


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
                    "chess-square";


                square.dataset.row =
                    row;


                square.dataset.column =
                    column;


                square.setAttribute(
                    "role",
                    "gridcell"
                );


                square.classList.add(

                    (
                        row + column
                    ) % 2 === 0

                        ? "light"

                        : "dark"

                );


                const piece =
                    chessGame.board[row][column];


                if (piece) {

                    const pieceElement =
                        document.createElement(
                            "span"
                        );


                    pieceElement.className =
                        `chess-piece chess-piece-${piece.color}`;


                    pieceElement.textContent =
                        chessPieces[
                            piece.color
                        ][
                            piece.type
                        ];


                    pieceElement.setAttribute(

                        "aria-label",

                        `${piece.color} ${piece.type}`

                    );


                    square.appendChild(
                        pieceElement
                    );

                }


                /* SELECTED */

                if (

                    chessGame.selected &&

                    chessGame.selected.row === row &&

                    chessGame.selected.column === column

                ) {

                    square.classList.add(
                        "selected"
                    );

                }


                /* LEGAL MOVE */

                const legalMove =
                    chessGame.legalMoves.find(

                        move =>

                            move.row === row &&

                            move.column === column

                    );


                if (legalMove) {

                    square.classList.add(
                        "legal-move"
                    );


                    if (piece) {

                        square.classList.add(
                            "capture-move"
                        );

                    }

                }


                /* LAST MOVE */

                if (
                    chessGame.lastMove
                ) {

                    const from =
                        chessGame.lastMove.from;

                    const to =
                        chessGame.lastMove.to;


                    if (

                        (
                            from.row === row &&
                            from.column === column
                        ) ||

                        (
                            to.row === row &&
                            to.column === column
                        )

                    ) {

                        square.classList.add(
                            "last-move"
                        );

                    }

                }


                square.addEventListener(
                    "click",
                    () => {

                        handleChessSquareClick(
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


    /* =====================================================
       19. HANDLE CLICK
    ===================================================== */

    function handleChessSquareClick(
        row,
        column
    ) {

        if (

            !chessGame.playing ||
            chessGame.gameOver

        ) {

            return;

        }


        const piece =
            chessGame.board[row][column];


        const selectedMove =
            chessGame.legalMoves.find(

                move =>

                    move.row === row &&
                    move.column === column

            );


        /* MOVE */

        if (
            chessGame.selected &&
            selectedMove
        ) {

            executeChessMove(

                chessGame.selected.row,

                chessGame.selected.column,

                selectedMove

            );


            return;

        }


        /* SELECT PIECE */

        if (

            piece &&
            piece.color === chessGame.turn

        ) {

            chessGame.selected = {

                row,
                column

            };


            chessGame.legalMoves =
                getChessLegalMoves(

                    chessGame.board,

                    row,

                    column

                );


            renderChessBoard();

            return;

        }


        /* CLEAR */

        chessGame.selected =
            null;

        chessGame.legalMoves =
            [];


        renderChessBoard();

    }


    /* =====================================================
       20. MOVE NOTATION
    ===================================================== */

    function createChessMoveNotation(
        piece,
        fromRow,
        fromColumn,
        move,
        capturedPiece
    ) {

        if (
            move.castle === "king"
        ) {

            return "O-O";

        }


        if (
            move.castle === "queen"
        ) {

            return "O-O-O";

        }


        const symbols = {

            pawn: "",

            knight: "N",

            bishop: "B",

            rook: "R",

            queen: "Q",

            king: "K"

        };


        let notation =
            symbols[piece.type];


        if (

            piece.type === "pawn" &&
            capturedPiece

        ) {

            notation +=
                "abcdefgh"[fromColumn];

        }


        if (capturedPiece) {

            notation += "x";

        }


        notation +=
            chessSquareName(
                move.row,
                move.column
            );


        if (
            move.promotion
        ) {

            notation += "=Q";

        }


        return notation;

    }


    /* =====================================================
       21. EXECUTE MOVE
    ===================================================== */

    function executeChessMove(
        fromRow,
        fromColumn,
        move
    ) {

        const piece =
            chessGame.board[fromRow][fromColumn];


        if (!piece) {

            return;

        }


        const target =
            chessGame.board[move.row][move.column];


        /* CAPTURE */

        let capturedPiece =
            target || null;


        if (
            move.enPassant
        ) {

            const captureRow =
                piece.color === "white"
                    ? move.row + 1
                    : move.row - 1;


            capturedPiece =
                chessGame.board[
                    captureRow
                ][
                    move.column
                ];

        }


        /* SAVE STATE */

        const stateBeforeMove = {

            board:
                cloneChessBoard(
                    chessGame.board
                ),

            turn:
                chessGame.turn,

            lastMove:
                chessGame.lastMove
                    ? structuredClone(
                        chessGame.lastMove
                    )
                    : null,

            capturedWhite:
                [...chessGame.capturedWhite],

            capturedBlack:
                [...chessGame.capturedBlack]

        };


        const notation =
            createChessMoveNotation(

                piece,

                fromRow,

                fromColumn,

                move,

                capturedPiece

            );


        chessGame.moveHistory.push({

            notation,

            state:
                stateBeforeMove

        });


        /* CAPTURE TRACKING */

        if (capturedPiece) {

            if (
                capturedPiece.color === "white"
            ) {

                chessGame.capturedBlack.push(
                    capturedPiece
                );

            }

            else {

                chessGame.capturedWhite.push(
                    capturedPiece
                );

            }

        }


        /* APPLY */

        chessGame.board =
            simulateChessMove(

                chessGame.board,

                fromRow,

                fromColumn,

                move

            );


        /* LAST MOVE */

        chessGame.lastMove = {

            from: {

                row: fromRow,

                column: fromColumn

            },

            to: {

                row: move.row,

                column: move.column

            },

            piece: {

                ...piece

            }

        };


        /* TURN */

        chessGame.turn =
            oppositeChessColor(
                chessGame.turn
            );


        chessGame.selected =
            null;

        chessGame.legalMoves =
            [];


        renderChessBoard();

        renderChessCaptured();

        renderChessHistory();

        updateChessStatus();

        evaluateChessGame();

        updateChessButtons();

    }


    /* =====================================================
       22. STATUS
    ===================================================== */

    function updateChessStatus() {

        if (
            chessElements.turn
        ) {

            chessElements.turn.textContent =
                chessGame.turn.toUpperCase();

        }


        if (
            chessElements.status &&
            !chessGame.gameOver
        ) {

            if (
                isChessInCheck(
                    chessGame.board,
                    chessGame.turn
                )
            ) {

                chessElements.status.textContent =
                    `${chessGame.turn.toUpperCase()} is in check!`;

            }

            else {

                chessElements.status.textContent =
                    `${chessGame.turn.toUpperCase()} to move.`;

            }

        }

    }


    function showChessStatus(message) {

        if (
            chessElements.status
        ) {

            chessElements.status.textContent =
                message;

        }

    }


    /* =====================================================
       23. CAPTURED PIECES
    ===================================================== */

    function renderChessCaptured() {

        renderCapturedGroup(

            chessElements.capturedWhite,

            chessGame.capturedWhite

        );


        renderCapturedGroup(

            chessElements.capturedBlack,

            chessGame.capturedBlack

        );

    }


    function renderCapturedGroup(
        container,
        pieces
    ) {

        if (!container) {

            return;

        }


        container.innerHTML =
            "";


        pieces.forEach(
            piece => {

                const span =
                    document.createElement(
                        "span"
                    );


                span.className =
                    `chess-captured-piece chess-piece-${piece.color}`;


                span.textContent =
                    chessPieces[
                        piece.color
                    ][
                        piece.type
                    ];


                container.appendChild(
                    span
                );

            }
        );

    }


    /* =====================================================
       24. MOVE HISTORY
    ===================================================== */

    function renderChessHistory() {

        const container =
            chessElements.moveHistory;


        if (!container) {

            return;

        }


        container.innerHTML =
            "";


        if (
            chessGame.moveHistory.length === 0
        ) {

            const empty =
                document.createElement(
                    "div"
                );


            empty.className =
                "chess-history-empty";


            empty.textContent =
                "No moves yet.";


            container.appendChild(
                empty
            );

        }

        else {

            for (
                let i = 0;
                i < chessGame.moveHistory.length;
                i += 2
            ) {

                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "chess-move-row";


                const number =
                    document.createElement(
                        "span"
                    );


                number.className =
                    "chess-move-number";


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
                    "chess-move-white";


                white.textContent =
                    chessGame.moveHistory[i]
                        .notation;


                row.appendChild(
                    white
                );


                const black =
                    document.createElement(
                        "span"
                    );


                black.className =
                    "chess-move-black";


                black.textContent =
                    chessGame.moveHistory[i + 1]
                        ? chessGame.moveHistory[i + 1].notation
                        : "—";


                row.appendChild(
                    black
                );


                container.appendChild(
                    row
                );

            }

        }


        if (
            chessElements.moveCount
        ) {

            const count =
                chessGame.moveHistory.length;


            chessElements.moveCount.textContent =
                `${count} ${
                    count === 1
                        ? "move"
                        : "moves"
                }`;

        }

    }


    /* =====================================================
       25. EVALUATE GAME
    ===================================================== */

    function evaluateChessGame() {

        const color =
            chessGame.turn;


        const legalMoves =
            getAllChessLegalMoves(
                chessGame.board,
                color
            );


        const inCheck =
            isChessInCheck(
                chessGame.board,
                color
            );


        if (
            legalMoves.length === 0 &&
            inCheck
        ) {

            endChessGame(

                "checkmate",

                oppositeChessColor(color)

            );


            return;

        }


        if (
            legalMoves.length === 0 &&
            !inCheck
        ) {

            endChessGame(
                "stalemate",
                null
            );


            return;

        }


        if (inCheck) {

            showChessStatus(
                `${color.toUpperCase()} is in check!`
            );

        }

    }


    /* =====================================================
       26. UNDO
    ===================================================== */

    function undoChessMove() {

        if (
            chessGame.moveHistory.length === 0 ||
            chessGame.gameOver
        ) {

            return;

        }


        const last =
            chessGame.moveHistory.pop();


        if (!last) {

            return;

        }


        chessGame.board =
            cloneChessBoard(
                last.state.board
            );


        chessGame.turn =
            last.state.turn;


        chessGame.lastMove =
            last.state.lastMove;


        chessGame.capturedWhite =
            [...last.state.capturedWhite];


        chessGame.capturedBlack =
            [...last.state.capturedBlack];


        chessGame.selected =
            null;


        chessGame.legalMoves =
            [];


        renderChessBoard();

        renderChessCaptured();

        renderChessHistory();

        updateChessStatus();

        updateChessButtons();

    }


    /* =====================================================
       27. RESIGN
    ===================================================== */

    function resignChessGame() {

        if (
            chessGame.gameOver ||
            !chessGame.playing
        ) {

            return;

        }


        const winner =
            oppositeChessColor(
                chessGame.turn
            );


        endChessGame(
            "resign",
            winner
        );

    }


    /* =====================================================
       28. END GAME
    ===================================================== */

    function endChessGame(
        reason,
        winner
    ) {

        chessGame.gameOver =
            true;


        chessGame.playing =
            false;


        chessGame.result = {

            reason,

            winner

        };


        let title =
            "";


        let message =
            "";


        if (
            reason === "checkmate"
        ) {

            title =
                "CHECKMATE";


            message =
                `${winner.toUpperCase()} wins the game.`;

        }


        else if (
            reason === "stalemate"
        ) {

            title =
                "STALEMATE";


            message =
                "The game ends in a draw.";

        }


        else {

            title =
                "RESIGNATION";


            message =
                `${winner.toUpperCase()} wins by resignation.`;

        }


        if (
            chessElements.result
        ) {

            chessElements.result.hidden =
                false;

        }


        if (
            chessElements.resultTitle
        ) {

            chessElements.resultTitle.textContent =
                title;

        }


        if (
            chessElements.resultMessage
        ) {

            chessElements.resultMessage.textContent =
                message;

        }


        if (
            chessElements.resultMoves
        ) {

            chessElements.resultMoves.textContent =
                chessGame.moveHistory.length;

        }


        if (
            chessElements.resultWinner
        ) {

            chessElements.resultWinner.textContent =
                winner
                    ? winner.toUpperCase()
                    : "DRAW";

        }


        showChessStatus(
            message
        );


        updateChessButtons();

    }


    /* =====================================================
       29. BUTTONS
    ===================================================== */

    function updateChessButtons() {

        if (
            chessElements.undo
        ) {

            chessElements.undo.disabled =
                chessGame.moveHistory.length === 0 ||
                chessGame.gameOver;

        }


        if (
            chessElements.resign
        ) {

            chessElements.resign.disabled =
                !chessGame.playing ||
                chessGame.gameOver;

        }

    }


    /* =====================================================
       30. NEW GAME
    ===================================================== */

    function newChessGame() {

        chessGame.playing =
            true;


        chessGame.gameOver =
            false;


        chessGame.turn =
            chessConfig.startingTurn;


        chessGame.board =
            createStartingChessBoard();


        chessGame.selected =
            null;


        chessGame.legalMoves =
            [];


        chessGame.moveHistory =
            [];


        chessGame.capturedWhite =
            [];


        chessGame.capturedBlack =
            [];


        chessGame.lastMove =
            null;


        chessGame.result =
            null;


        if (
            chessElements.result
        ) {

            chessElements.result.hidden =
                true;

        }


        renderChessBoard();

        renderChessCaptured();

        renderChessHistory();

        updateChessStatus();

        updateChessButtons();


        console.log(
            "♟ New DigiCafe Chess game started."
        );

    }


    /* =====================================================
       31. PLAY AGAIN
    ===================================================== */

    function playChessAgain() {

        newChessGame();

    }


    /* =====================================================
       32. EVENTS
    ===================================================== */

    function setupChessEvents() {

        if (
            chessElements.newGame
        ) {

            chessElements.newGame.addEventListener(
                "click",
                newChessGame
            );

        }


        if (
            chessElements.undo
        ) {

            chessElements.undo.addEventListener(
                "click",
                undoChessMove
            );

        }


        if (
            chessElements.resign
        ) {

            chessElements.resign.addEventListener(
                "click",
                resignChessGame
            );

        }


        if (
            chessElements.playAgain
        ) {

            chessElements.playAgain.addEventListener(
                "click",
                playChessAgain
            );

        }

    }


    /* =====================================================
       33. INITIALIZE
    ===================================================== */

    function initChess() {

        const room =
            document.getElementById(
                "chessGame"
            );


        if (!room) {

            console.warn(
                "♟ Chess room not found."
            );

            return false;

        }


        if (
            chessGame.initialized
        ) {

            renderChessBoard();

            updateChessStatus();

            return true;

        }


        if (
            !setupChessElements()
        ) {

            return false;

        }


        setupChessEvents();


        chessGame.initialized =
            true;


        newChessGame();


        console.log(
            "♟ DigiCafe Chess ready."
        );


        return true;

    }


    /* =====================================================
       34. RESET
    ===================================================== */

    function resetChessInitialization() {

        chessGame.initialized =
            false;

        chessGame.playing =
            false;

        chessGame.gameOver =
            false;

        chessGame.board =
            [];

        chessGame.selected =
            null;

        chessGame.legalMoves =
            [];

        chessGame.moveHistory =
            [];

        chessGame.capturedWhite =
            [];

        chessGame.capturedBlack =
            [];

        chessGame.lastMove =
            null;

        chessGame.result =
            null;

    }


    /* =====================================================
       35. GLOBAL API
    ===================================================== */

    window.chessGame =
        chessGame;


    window.initChess =
        initChess;


    window.newChessGame =
        newChessGame;


    window.playChessAgain =
        playChessAgain;


    window.undoChessMove =
        undoChessMove;


    window.resignChessGame =
        resignChessGame;


    window.resetChessInitialization =
        resetChessInitialization;


    /* =====================================================
       36. READY
    ===================================================== */

    console.log(
        "♟ DigiCafe Chess engine loaded."
    );


})();

