 /* =========================================================
   DIGICAFE PLAYROOM
   ---------------------------------------------------------
   Handles ONLY:

   • Game lounge
   • Opening game rooms
   • Closing game rooms
   • Back to Games buttons
   • Game initialization
   • Public Playroom API

   Games themselves remain in:
   • solitaire.js
   • bingo.js
   • slots.js
   • chess.js
   • dama.js
========================================================= */

(() => {

    "use strict";


    /* =====================================================
       PREVENT DUPLICATE INITIALIZATION
    ===================================================== */

    if (window.__DigiCafePlayroomLoaded) {

        console.warn(
            "🎮 DigiCafe Playroom is already loaded."
        );

        return;

    }


    window.__DigiCafePlayroomLoaded = true;


    /* =====================================================
       GAME INITIALIZERS
    ===================================================== */

    function initializeGame(gameName) {

        console.log(
            `🎮 Initializing ${gameName}...`
        );


        try {

            switch (gameName) {


                /* =========================================
                   SOLITAIRE
                ========================================= */

                case "solitaire":

                    if (
                        typeof window.initSolitaire ===
                        "function"
                    ) {

                        return window.initSolitaire();

                    }

                    console.warn(
                        "🃏 initSolitaire() not found."
                    );

                    break;


                /* =========================================
                   BINGO
                ========================================= */

                case "bingo":

                    if (
                        typeof window.initBingo ===
                        "function"
                    ) {

                        return window.initBingo();

                    }

                    if (
                        typeof window.setupBingo ===
                        "function"
                    ) {

                        return window.setupBingo();

                    }

                    console.warn(
                        "🎱 Bingo initializer not found."
                    );

                    break;


                /* =========================================
                   SLOTS
                ========================================= */

                case "slots":

                    if (
                        typeof window.initCafeSlots ===
                        "function"
                    ) {

                        return window.initCafeSlots();

                    }

                    console.warn(
                        "🎰 initCafeSlots() not found."
                    );

                    break;


                /* =========================================
                   CHESS
                ========================================= */

                case "chess":

                    if (
                        typeof window.initChess ===
                        "function"
                    ) {

                        return window.initChess();

                    }

                    if (
                        typeof window.setupChess ===
                        "function"
                    ) {

                        return window.setupChess();

                    }

                    console.warn(
                        "♟️ Chess initializer not found."
                    );

                    break;


                /* =========================================
                   DAMA
                ========================================= */

                case "dama":

                    if (
                        typeof window.initDama ===
                        "function"
                    ) {

                        return window.initDama();

                    }

                    if (
                        typeof window.setupDama ===
                        "function"
                    ) {

                        return window.setupDama();

                    }

                    console.warn(
                        "⚫ Dama initializer not found."
                    );

                    break;


                default:

                    console.warn(
                        `🎮 Unknown game "${gameName}".`
                    );

            }

        }

        catch (error) {

            /*
                IMPORTANT:

                A broken game should NOT break
                the Playroom navigation itself.
            */

            console.error(
                `❌ Error initializing ${gameName}:`,
                error
            );

        }

    }


    /* =====================================================
       PLAYROOM SETUP
    ===================================================== */

    function setupPlayroomGames() {

        const playroom =
            document.getElementById(
                "playroom"
            );


        if (!playroom) {

            console.warn(
                "🎮 #playroom was not found."
            );

            return false;

        }


        const lounge =
            playroom.querySelector(
                ".game-lounge"
            );


        /*
            IMPORTANT:

            Do NOT use :scope here.

            The Playroom HTML is dynamically loaded,
            and a plain querySelectorAll is safer.
        */

        const gameRooms =
            Array.from(
                playroom.querySelectorAll(
                    ".game-room"
                )
            );


        const gameButtons =
            Array.from(
                playroom.querySelectorAll(
                    "[data-game]"
                )
            );


        console.log(
            "🎮 Playroom rooms found:",
            gameRooms.map(
                room =>
                    room.dataset.gameRoom
            )
        );


        /* =================================================
           SHOW LOBBY
        ================================================= */

        function showLobby() {

            console.log(
                "☕ Returning to Playroom lobby."
            );


            gameRooms.forEach(
                room => {

                    room.hidden =
                        true;

                    room.classList.remove(
                        "game-active",
                        "game-room-active"
                    );

                }
            );


            if (lounge) {

                lounge.hidden =
                    false;

            }


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


            /*
                Return to top of Playroom.
            */

            requestAnimationFrame(
                () => {

                    playroom.scrollIntoView({

                        behavior:
                            "smooth",

                        block:
                            "start"

                    });

                }
            );

        }


        /* =================================================
           SHOW GAME
        ================================================= */

        function showGame(
            gameName
        ) {

            if (!gameName) {

                console.warn(
                    "🎮 No game name supplied."
                );

                return false;

            }


            console.log(
                "🎮 Opening game:",
                gameName
            );


            const selectedRoom =
                gameRooms.find(
                    room =>
                        room.dataset.gameRoom ===
                        gameName
                );


            /*
                GAME DOES NOT EXIST
            */

            if (!selectedRoom) {

                console.error(
                    `🎮 No room found for "${gameName}".`
                );


                console.log(
                    "Available rooms:",
                    gameRooms.map(
                        room =>
                            room.dataset.gameRoom
                    )
                );


                showLobby();

                return false;

            }


            /*
                Hide lounge.
            */

            if (lounge) {

                lounge.hidden =
                    true;

            }


            /*
                Hide every game except
                the selected one.
            */

            gameRooms.forEach(
                room => {

                    const active =
                        room ===
                        selectedRoom;


                    room.hidden =
                        !active;


                    room.classList.toggle(
                        "game-active",
                        active
                    );


                    room.classList.toggle(
                        "game-room-active",
                        active
                    );

                }
            );


            /*
                Update state.
            */

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


            /*
                Initialize the selected game.

                IMPORTANT:
                The room remains open even if
                its game JS has an error.
            */

            initializeGame(
                gameName
            );


            /*
                Scroll AFTER the room has
                been displayed.
            */

            requestAnimationFrame(
                () => {

                    selectedRoom.scrollIntoView({

                        behavior:
                            "smooth",

                        block:
                            "start"

                    });

                }
            );


            return true;

        }


        /* =================================================
           GAME CARD EVENTS
           -------------------------------------------------
           Event delegation avoids duplicate listeners.
        ================================================= */

        playroom.addEventListener(
            "click",
            event => {

                const gameButton =
                    event.target.closest(
                        "[data-game]"
                    );


                if (
                    gameButton &&
                    playroom.contains(
                        gameButton
                    )
                ) {

                    event.preventDefault();


                    const gameName =
                        gameButton.dataset.game;


                    showGame(
                        gameName
                    );


                    return;

                }


                /*
                    BACK TO GAMES
                */

                const backButton =
                    event.target.closest(
                        "[data-back-to-games]"
                    );


                if (
                    backButton &&
                    playroom.contains(
                        backButton
                    )
                ) {

                    event.preventDefault();

                    event.stopPropagation();


                    showLobby();

                }

            }
        );


        /* =================================================
           INITIAL STATE
        ================================================= */

        showLobby();


        /* =================================================
           PUBLIC API
        ================================================= */

        playroom.showGame =
            showGame;


        playroom.showLobby =
            showLobby;


        window.playroomShowGame =
            showGame;


        window.playroomShowLobby =
            showLobby;


        console.log(
            "🎮 DigiCafe Playroom ready."
        );


        return true;

    }


    /* =====================================================
       OPEN GAME API
    ===================================================== */

    function openPlayroomGame(
        gameName
    ) {

        const playroom =
            document.getElementById(
                "playroom"
            );


        if (!playroom) {

            console.warn(
                "🎮 Playroom not found."
            );

            return false;

        }


        if (
            typeof playroom.showGame ===
            "function"
        ) {

            return playroom.showGame(
                gameName
            );

        }


        /*
            Playroom may have just been
            dynamically loaded.
        */

        if (
            setupPlayroomGames()
        ) {

            return playroom.showGame(
                gameName
            );

        }


        console.warn(
            "🎮 Playroom system is not initialized."
        );


        return false;

    }


    /* =====================================================
       CLOSE GAME API
    ===================================================== */

    function closePlayroomGame() {

        const playroom =
            document.getElementById(
                "playroom"
            );


        if (!playroom) {

            return false;

        }


        if (
            typeof playroom.showLobby ===
            "function"
        ) {

            playroom.showLobby();

            return true;

        }


        if (
            setupPlayroomGames()
        ) {

            playroom.showLobby();

            return true;

        }


        return false;

    }


    /* =====================================================
       GLOBAL API
    ===================================================== */

    window.setupPlayroomGames =
        setupPlayroomGames;


    window.openPlayroomGame =
        openPlayroomGame;


    window.closePlayroomGame =
        closePlayroomGame;


    window.initializePlayroomGame =
        initializeGame;


    console.log(
        "☕ DigiCafe Playroom controller loaded."
    );

})();
