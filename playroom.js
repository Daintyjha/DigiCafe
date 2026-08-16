  console.log("🎮 DigiCafe Playroom Loaded");


/* =====================================================
   DIGICAFE PLAYROOM
   -----------------------------------------------------
   Handles ONLY:

   • Playroom lobby
   • Game selection
   • Opening game rooms
   • Closing game rooms
   • Back to Games buttons
   • Calling individual game initializers

   Individual game logic stays in:

   • solitaire.js
   • bingo.js
   • slots.js
   • chess.js
   • dama.js
===================================================== */


/* =====================================================
   01. PLAYROOM STATE
===================================================== */

let playroomInitialized = false;


/* =====================================================
   02. SETUP PLAYROOM
===================================================== */

function setupPlayroomGames() {

    const playroom =
        document.querySelector(".playroom");


    if (!playroom) {

        console.warn(
            "🎮 Playroom not found."
        );

        return;

    }


    /* Prevent duplicate initialization */

    if (playroomInitialized) {

        console.log(
            "🎮 Playroom already initialized."
        );

        return;

    }


    playroomInitialized = true;


    /* =================================================
       PLAYROOM LOUNGE
    ================================================= */

    const gameLounge =
        playroom.querySelector(".game-lounge");


    /* =================================================
       GAME ROOMS
    ================================================= */

    const gameRooms =
        playroom.querySelectorAll(
            ":scope > .game-room"
        );


    /* =================================================
       GAME BUTTONS

       IMPORTANT:
       Only buttons that actually have
       data-game are game selection buttons.
    ================================================= */

    const gameButtons =
        playroom.querySelectorAll(
            ".game-card[data-game]"
        );


    console.log(
        "🎮 Game buttons found:",
        gameButtons.length
    );


    console.log(
        "🎮 Game rooms found:",
        gameRooms.length
    );


    /* =================================================
       SHOW PLAYROOM LOBBY
    ================================================= */

    function showPlayroomLobby() {

        console.log(
            "☕ Returning to Playroom lobby."
        );


        /* ---------------------------------------------
           Hide ALL game rooms
        --------------------------------------------- */

        gameRooms.forEach(room => {

            room.hidden = true;

            room.classList.remove(
                "game-active",
                "game-room-active"
            );

        });


        /* ---------------------------------------------
           Show lounge
        --------------------------------------------- */

        if (gameLounge) {

            gameLounge.hidden = false;

        }


        /* ---------------------------------------------
           Remove active game state
        --------------------------------------------- */

        playroom.classList.remove(
            "playing-game"
        );


        playroom.removeAttribute(
            "data-active-game"
        );


        document.body.classList.remove(
            "playing-digicafe-game"
        );


        document.body.removeAttribute(
            "data-active-game"
        );


        /* ---------------------------------------------
           Scroll to lobby
        --------------------------------------------- */

        playroom.scrollIntoView({

            behavior: "smooth",

            block: "start"

        });

    }


    /* =================================================
       OPEN GAME
    ================================================= */

    function showGame(gameName) {

        if (!gameName) {

            console.warn(
                "🎮 No game name supplied."
            );

            return;

        }


        console.log(
            "🎮 Opening game:",
            gameName
        );


        let selectedRoom = null;


        /* ---------------------------------------------
           Find and show selected room
        --------------------------------------------- */

        gameRooms.forEach(room => {

            const roomName =
                room.dataset.gameRoom;


            const isActive =
                roomName === gameName;


            room.hidden =
                !isActive;


            room.classList.toggle(
                "game-active",
                isActive
            );


            room.classList.toggle(
                "game-room-active",
                isActive
            );


            if (isActive) {

                selectedRoom = room;

            }

        });


        /* ---------------------------------------------
           Game not found
        --------------------------------------------- */

        if (!selectedRoom) {

            console.error(
                `🎮 Game room "${gameName}" was not found.`
            );


            showPlayroomLobby();

            return;

        }


        /* ---------------------------------------------
           Hide lobby
        --------------------------------------------- */

        if (gameLounge) {

            gameLounge.hidden = true;

        }


        /* ---------------------------------------------
           Set active game state
        --------------------------------------------- */

        playroom.classList.add(
            "playing-game"
        );


        playroom.dataset.activeGame =
            gameName;


        document.body.classList.add(
            "playing-digicafe-game"
        );


        document.body.dataset.activeGame =
            gameName;


        /* ---------------------------------------------
           Initialize selected game
        --------------------------------------------- */

        initializePlayroomGame(
            gameName
        );


        /* ---------------------------------------------
           Scroll to selected game
        --------------------------------------------- */

        selectedRoom.scrollIntoView({

            behavior: "smooth",

            block: "start"

        });

    }


    /* =================================================
       GAME CARD CLICK
    ================================================= */

    gameButtons.forEach(button => {

        button.addEventListener(
            "click",
            event => {

                event.preventDefault();


                const gameName =
                    button.dataset.game;


                showGame(
                    gameName
                );

            }
        );

    });


    /* =================================================
       BACK TO GAMES
       -------------------------------------------------
       EVENT DELEGATION

       This works for ALL game rooms:

       • Solitaire
       • Bingo
       • Slots
       • Chess
       • Dama
    ================================================= */

    playroom.addEventListener(
        "click",
        event => {

            const backButton =
                event.target.closest(
                    "[data-back-to-games]"
                );


            if (!backButton) {

                return;

            }


            if (
                !playroom.contains(
                    backButton
                )
            ) {

                return;

            }


            event.preventDefault();

            event.stopPropagation();


            console.log(
                "🎮 Back to Games clicked."
            );


            showPlayroomLobby();

        }
    );


    /* =================================================
       INITIAL STATE
    ================================================= */

    showPlayroomLobby();


    /* =================================================
       PUBLIC PLAYROOM API
    ================================================= */

    playroom.showGame =
        showGame;


    playroom.showLobby =
        showPlayroomLobby;


    window.playroomShowGame =
        showGame;


    window.playroomShowLobby =
        showPlayroomLobby;


    console.log(
        "🎮 Playroom game system ready."
    );

}


/* =====================================================
   03. INITIALIZE INDIVIDUAL GAME
===================================================== */

function initializePlayroomGame(gameName) {

    console.log(
        "🎮 Initializing game:",
        gameName
    );


    switch (gameName) {


        /* =============================================
           SOLITAIRE
        ============================================== */

        case "solitaire":

            if (
                typeof window.initSolitaire ===
                "function"
            ) {

                window.initSolitaire();

            }

            else if (
                typeof window.setupSolitaire ===
                "function"
            ) {

                window.setupSolitaire();

            }

            else {

                console.warn(
                    "🃏 Solitaire initializer not found."
                );

            }

            break;


        /* =============================================
           BINGO
        ============================================== */

        case "bingo":

            if (
                typeof window.initBingo ===
                "function"
            ) {

                window.initBingo();

            }

            else if (
                typeof window.setupBingo ===
                "function"
            ) {

                window.setupBingo();

            }

            else {

                console.warn(
                    "🎱 Bingo initializer not found."
                );

            }

            break;


        /* =============================================
           SLOTS
        ============================================== */

        case "slots":

            if (
                typeof window.initCafeSlots ===
                "function"
            ) {

                window.initCafeSlots();

            }

            else {

                console.warn(
                    "🎰 Café Slots initializer not found."
                );

            }

            break;


        /* =============================================
           CHESS
        ============================================== */

        case "chess":

            if (
                typeof window.initChess ===
                "function"
            ) {

                window.initChess();

            }

            else if (
                typeof window.setupChess ===
                "function"
            ) {

                window.setupChess();

            }

            else {

                console.warn(
                    "♟️ Chess initializer not found."
                );

            }

            break;


        /* =============================================
           DAMA
        ============================================== */

        case "dama":

            if (
                typeof window.initDama ===
                "function"
            ) {

                window.initDama();

            }

            else if (
                typeof window.setupDama ===
                "function"
            ) {

                window.setupDama();

            }

            else {

                console.warn(
                    "⚫ Dama initializer not found."
                );

            }

            break;


        /* =============================================
           UNKNOWN GAME
        ============================================== */

        default:

            console.warn(
                `🎮 Unknown game: ${gameName}`
            );

    }

}


/* =====================================================
   04. OPEN GAME
===================================================== */

function openPlayroomGame(gameName) {

    const playroom =
        document.querySelector(
            ".playroom"
        );


    if (!playroom) {

        console.warn(
            "🎮 Playroom not found."
        );

        return;

    }


    if (
        typeof playroom.showGame ===
        "function"
    ) {

        playroom.showGame(
            gameName
        );

    }

    else {

        console.warn(
            "🎮 Playroom system is not initialized."
        );

    }

}


/* =====================================================
   05. CLOSE GAME
===================================================== */

function closePlayroomGame() {

    const playroom =
        document.querySelector(
            ".playroom"
        );


    if (!playroom) {

        return;

    }


    if (
        typeof playroom.showLobby ===
        "function"
    ) {

        playroom.showLobby();

    }

    else {

        console.warn(
            "🎮 Playroom system is not initialized."
        );

    }

}


/* =====================================================
   06. GLOBAL PLAYROOM API
===================================================== */

window.setupPlayroomGames =
    setupPlayroomGames;


window.openPlayroomGame =
    openPlayroomGame;


window.closePlayroomGame =
    closePlayroomGame;


window.initializePlayroomGame =
    initializePlayroomGame;


console.log(
    "☕ DigiCafe Playroom JS ready."
);
