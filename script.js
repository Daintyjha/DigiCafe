
console.log("☕ DigiCafe Shell Loaded");


/* =====================================================
   DIGICAFE MAIN SHELL
   -----------------------------------------------------
   Handles:

   • Global page navigation
   • Dynamic room loading
   • Navbar
   • Mobile menu
   • Reader loading
   • Music Lounge loading
   • Library rendering
   • Playroom navigation
   • Individual game initialization
   • Browser back / forward navigation

   IMPORTANT:
   Each Playroom game has its own JS file.

   Games:
   • solitaire.js
   • slots.js
   • bingo.js
   • chess.js
   • dama.js

   This file does NOT contain game engines.
===================================================== */


/* =====================================================
   01. PAGE CONFIGURATION
===================================================== */

const pages = {

    home: "home.html",

    music: "music.html",

    library: "library.html",

    romance: "romance.html",

    comedy: "comedy.html",

    scifi: "scifi.html",

    reader: "reader.html",

    about: "about.html",

    playroom: "playroom.html",

    account: "account.html"

};


/* =====================================================
   02. READER MODULE STATE

   Reader is loaded only when needed.
===================================================== */

let readerModuleLoaded = false;

let readerModuleLoading = null;


async function loadReaderModule() {

    if (readerModuleLoaded) {
        return;
    }


    if (readerModuleLoading) {

        await readerModuleLoading;

        return;

    }


    readerModuleLoading =
        import("./reader.js")
            .then(() => {

                readerModuleLoaded =
                    true;

                console.log(
                    "📖 Reader module loaded."
                );

            })
            .catch(error => {

                console.error(
                    "❌ Could not load reader.js:",
                    error
                );

                readerModuleLoading =
                    null;

                throw error;

            });


    await readerModuleLoading;

}


/* =====================================================
   03. MUSIC LOUNGE MODULE STATE

   music.js is loaded only when Music Lounge opens.
===================================================== */

let musicModuleLoaded = false;

let musicModuleLoading = null;


async function loadMusicModule() {

    if (musicModuleLoaded) {
        return;
    }


    if (musicModuleLoading) {

        await musicModuleLoading;

        return;

    }


    musicModuleLoading =
        new Promise(
            (resolve, reject) => {

                const existingScript =
                    document.querySelector(
                        'script[src="music.js"]'
                    );


                /* -----------------------------------------
                   SCRIPT ALREADY EXISTS
                ----------------------------------------- */

                if (existingScript) {

                    musicModuleLoaded =
                        true;

                    console.log(
                        "🎵 Music Lounge script already loaded."
                    );

                    resolve();

                    return;

                }


                /* -----------------------------------------
                   CREATE SCRIPT
                ----------------------------------------- */

                const script =
                    document.createElement(
                        "script"
                    );


                script.src =
                    "music.js";


                script.async =
                    false;


                script.onload =
                    () => {

                        musicModuleLoaded =
                            true;

                        console.log(
                            "🎵 Music Lounge module loaded."
                        );

                        resolve();

                    };


                script.onerror =
                    error => {

                        console.error(
                            "❌ Could not load music.js:",
                            error
                        );

                        musicModuleLoading =
                            null;

                        reject(
                            new Error(
                                "Could not load music.js"
                            )
                        );

                    };


                document.body.appendChild(
                    script
                );

            }
        );


    await musicModuleLoading;

}


/* =====================================================
   04. DIGICAFE STARTUP
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log(
            "☕ Starting DigiCafe shell..."
        );


        /* =================================================
           LOAD GLOBAL COMPONENTS
        ================================================= */

        await loadComponent(
            "navbar",
            "navbar.html"
        );


        await loadComponent(
            "footer",
            "footer.html"
        );


        await loadComponent(
            "music-player",
            "music-player.html"
        );


        await loadComponent(
            "beshy-container",
            "Beshy/beshy.html"
        );


        /* =================================================
           INITIALIZE GLOBAL MUSIC PLAYER
        ================================================= */

        if (
            typeof window.initMusicPlayer ===
            "function"
        ) {

            window.initMusicPlayer();

            console.log(
                "🎵 Global Music Player initialized."
            );

        }

        else {

            console.error(
                "❌ initMusicPlayer() was not found."
            );

        }


        /* =================================================
           INITIALIZE NAVBAR
        ================================================= */

        initNavbar();


        /* =================================================
           INITIALIZE GLOBAL NAVIGATION
        ================================================= */

        initGlobalNavigation();


        /* =================================================
           LOAD INITIAL ROOM
        ================================================= */

        await loadInitialPage();


        console.log(
            "☕ DigiCafe shell ready."
        );

    }
);


/* =====================================================
   05. COMPONENT LOADER
===================================================== */

async function loadComponent(
    id,
    file
) {

    const element =
        document.getElementById(
            id
        );


    if (!element) {

        console.warn(
            `⚠️ Component container #${id} was not found.`
        );

        return false;

    }


    try {

        const response =
            await fetch(
                file
            );


        if (!response.ok) {

            throw new Error(
                `${file}: ${response.status}`
            );

        }


        element.innerHTML =
            await response.text();


        console.log(
            `✅ Loaded ${file}`
        );


        return true;

    }

    catch (error) {

        console.error(
            `❌ Could not load ${file}:`,
            error
        );

        return false;

    }

}


/* =====================================================
   06. INITIAL PAGE
===================================================== */

async function loadInitialPage() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    let page =
        params.get("page");


    const story =
        params.get("story");


    const chapter =
        params.get("chapter");


    if (!page) {

        page =
            "home";

    }


    if (!pages[page]) {

        page =
            "home";

    }


    console.log(
        "🌐 Initial page:",
        page
    );


    console.log(
        "📚 Initial story:",
        story
    );


    console.log(
        "📖 Initial chapter:",
        chapter
    );


    await navigateTo(
        page,
        false,
        story,
        chapter
    );

}


/* =====================================================
   07. LIBRARY
===================================================== */

window.initLibrary =
    async function () {

        console.log(
            "📚 Initializing DigiCafe Library..."
        );


        const blogList =
            document.getElementById(
                "blogList"
            );


        const discussionList =
            document.getElementById(
                "discussionList"
            );


        if (!window.STORIES) {

            console.error(
                "❌ window.STORIES is not available."
            );


            if (blogList) {

                blogList.innerHTML = `
                    <p class="library-empty">
                        Blog content could not be loaded.
                    </p>
                `;

            }


            if (discussionList) {

                discussionList.innerHTML = `
                    <p class="library-empty">
                        Discussion content could not be loaded.
                    </p>
                `;

            }


            return;

        }


        if (blogList) {

            blogList.innerHTML =
                "";

        }


        if (discussionList) {

            discussionList.innerHTML =
                "";

        }


        let blogCount =
            0;


        let discussionCount =
            0;


        Object.entries(
            window.STORIES
        ).forEach(
            ([storyKey, story]) => {

                if (!story) {
                    return;
                }


                const contentType =
                    story.type ||
                    "novel";


                /* =========================================
                   BLOG
                ========================================= */

                if (
                    contentType === "blog" &&
                    blogList
                ) {

                    const item =
                        document.createElement(
                            "div"
                        );


                    item.className =
                        "library-content-item";


                    const link =
                        document.createElement(
                            "a"
                        );


                    link.href =
                        "#";


                    link.className =
                        "library-content-link";


                    link.dataset.page =
                        "reader";


                    link.dataset.story =
                        storyKey;


                    link.innerHTML = `

                        <span class="content-icon">
                            📝
                        </span>

                        <span class="content-info">

                            <strong>
                                ${escapeHTML(
                                    story.title ||
                                    storyKey
                                )}
                            </strong>

                            ${
                                story.published
                                    ? `
                                        <small>
                                            Published ${formatPublishedDate(
                                                story.published
                                            )}
                                        </small>
                                      `
                                    : ""
                            }

                        </span>

                    `;


                    item.appendChild(
                        link
                    );


                    blogList.appendChild(
                        item
                    );


                    blogCount++;

                }


                /* =========================================
                   DISCUSSION
                ========================================= */

                if (
                    contentType === "discussion" &&
                    discussionList
                ) {

                    const item =
                        document.createElement(
                            "div"
                        );


                    item.className =
                        "library-content-item";


                    const link =
                        document.createElement(
                            "a"
                        );


                    link.href =
                        "#";


                    link.className =
                        "library-content-link";


                    link.dataset.page =
                        "reader";


                    link.dataset.story =
                        storyKey;


                    link.innerHTML = `

                        <span class="content-icon">
                            💬
                        </span>

                        <span class="content-info">

                            <strong>
                                ${escapeHTML(
                                    story.title ||
                                    storyKey
                                )}
                            </strong>

                            ${
                                story.published
                                    ? `
                                        <small>
                                            Published ${formatPublishedDate(
                                                story.published
                                            )}
                                        </small>
                                      `
                                    : ""
                            }

                        </span>

                    `;


                    item.appendChild(
                        link
                    );


                    discussionList.appendChild(
                        item
                    );


                    discussionCount++;

                }

            }
        );


        if (
            blogList &&
            blogCount === 0
        ) {

            blogList.innerHTML = `
                <p class="library-empty">
                    No blog posts yet.
                </p>
            `;

        }


        if (
            discussionList &&
            discussionCount === 0
        ) {

            discussionList.innerHTML = `
                <p class="library-empty">
                    No discussions yet.
                </p>
            `;

        }


        console.log(
            "📝 Blog posts:",
            blogCount
        );


        console.log(
            "💬 Discussions:",
            discussionCount
        );


        console.log(
            "📚 DigiCafe Library ready."
        );

    };


/* =====================================================
   08. ESCAPE HTML
===================================================== */

function escapeHTML(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(
            value
        );


    return div.innerHTML;

}


/* =====================================================
   09. FORMAT DATE
===================================================== */

function formatPublishedDate(
    dateString
) {

    if (!dateString) {

        return "";

    }


    const date =
        new Date(
            dateString +
            "T00:00:00"
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return dateString;

    }


    return date.toLocaleDateString(
        "en-US",
        {
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );

}


/* =====================================================
   10. NAVIGATION
===================================================== */

async function navigateTo(
    page,
    updateHistory = true,
    story = null,
    chapter = null
) {

    if (!pages[page]) {

        console.warn(
            `⚠️ Unknown page "${page}". Returning home.`
        );

        page =
            "home";

    }


    const content =
        document.getElementById(
            "page-content"
        );


    if (!content) {

        console.error(
            "❌ #page-content was not found."
        );

        return;

    }


    try {

        content.classList.add(
            "page-loading"
        );


        /* =================================================
           LOAD ROOM HTML
        ================================================= */

        const response =
            await fetch(
                pages[page]
            );


        if (!response.ok) {

            throw new Error(
                `Failed to load ${pages[page]}: ${response.status}`
            );

        }


        const html =
            await response.text();


        content.innerHTML =
            html;


        /* =================================================
           PLAYROOM

           IMPORTANT:

           We ONLY prepare the Playroom navigation here.

           We DO NOT initialize every game.

           Each individual game is initialized only
           when the player opens that game.
        ================================================= */

        if (
            page === "playroom"
        ) {

            setupPlayroomGames();

        }


        /* =================================================
           CURRENT READER STORY
        ================================================= */

        if (
            page === "reader"
        ) {

            window.currentReaderStory =
                story;

        }

        else {

            window.currentReaderStory =
                null;

        }


        content.classList.remove(
            "page-loading"
        );


        /* =================================================
           UPDATE URL
        ================================================= */

        if (updateHistory) {

            let url;


            /* ---------------------------------------------
               HOME
            --------------------------------------------- */

            if (
                page === "home"
            ) {

                url =
                    "index.html";

            }


            /* ---------------------------------------------
               READER
            --------------------------------------------- */

            else if (
                page === "reader"
            ) {

                const params =
                    new URLSearchParams();


                params.set(
                    "page",
                    "reader"
                );


                if (story) {

                    params.set(
                        "story",
                        story
                    );

                }


                if (chapter) {

                    params.set(
                        "chapter",
                        chapter
                    );

                }


                url =
                    `index.html?${params.toString()}`;

            }


            /* ---------------------------------------------
               OTHER ROOMS
            --------------------------------------------- */

            else {

                url =
                    `index.html?page=${encodeURIComponent(
                        page
                    )}`;

            }


            window.history.pushState(
                {
                    page,
                    story,
                    chapter
                },
                "",
                url
            );

        }


        /* =================================================
           ACTIVE NAVIGATION
        ================================================= */

        highlightActiveLink(
            page
        );


        closeMobileMenu();


        /* =================================================
           BESHY PAGE
        ================================================= */

        document.body.dataset.beshyPage =
            page;


        /* =================================================
           ROOM INITIALIZATION
        ================================================= */

        switch (
            page
        ) {


            /* =============================================
               HOME
            ============================================= */

            case "home":

                if (
                    typeof window.initWelcome ===
                    "function"
                ) {

                    window.initWelcome();

                }

                break;


            /* =============================================
               MUSIC
            ============================================= */

            case "music":

                console.log(
                    "🎵 Opening Music Lounge..."
                );


                try {

                    await loadMusicModule();

                }

                catch (error) {

                    console.error(
                        "❌ Music Lounge module failed:",
                        error
                    );

                    break;

                }


                if (
                    typeof window.initMusicLounge ===
                    "function"
                ) {

                    await window.initMusicLounge();

                }

                else {

                    console.error(
                        "❌ initMusicLounge() was not found."
                    );

                }

                break;


            /* =============================================
               LIBRARY
            ============================================= */

            case "library":

                if (
                    typeof window.initLibrary ===
                    "function"
                ) {

                    await window.initLibrary();

                }

                else {

                    console.error(
                        "❌ initLibrary() was not found."
                    );

                }

                break;


            /* =============================================
               ROMANCE
            ============================================= */

            case "romance":

                console.log(
                    "💗 Opening Romance"
                );

                break;


            /* =============================================
               COMEDY
            ============================================= */

            case "comedy":

                console.log(
                    "😂 Opening Comedy"
                );

                break;


            /* =============================================
               SCI-FI
            ============================================= */

            case "scifi":

                console.log(
                    "🚀 Opening Sci-Fi"
                );

                break;


            /* =============================================
               READER
            ============================================= */

            case "reader":

                console.log(
                    "📖 Opening Reader"
                );


                console.log(
                    "📚 Story:",
                    story
                );


                console.log(
                    "📖 Chapter:",
                    chapter
                );


                try {

                    await loadReaderModule();

                }

                catch (error) {

                    console.error(
                        "❌ Reader module failed:",
                        error
                    );

                    break;

                }


                if (
                    typeof window.initReader ===
                    "function"
                ) {

                    let chapterNumber =
                        null;


                    if (
                        chapter !== null &&
                        chapter !== undefined &&
                        chapter !== ""
                    ) {

                        const parsedChapter =
                            parseInt(
                                chapter,
                                10
                            );


                        if (
                            Number.isInteger(
                                parsedChapter
                            )
                        ) {

                            chapterNumber =
                                parsedChapter;

                        }

                    }


                    await window.initReader(
                        story,
                        chapterNumber
                    );

                }

                else {

                    console.error(
                        "❌ initReader() was not found after loading reader.js."
                    );

                }

                break;


            /* =============================================
               ABOUT
            ============================================= */

            case "about":

                if (
                    typeof window.initAbout ===
                    "function"
                ) {

                    window.initAbout();

                }

                break;


            /* =============================================
               ACCOUNT
            ============================================= */

            case "account":

                if (
                    typeof window.initAccount ===
                    "function"
                ) {

                    window.initAccount();

                }

                break;


            /* =============================================
               PLAYROOM

               No game is initialized here.

               setupPlayroomGames() already prepared
               the game buttons.

               The selected game is initialized by
               openPlayroomGame().
            ============================================= */

            case "playroom":

                console.log(
                    "🎮 DigiCafe Playroom ready."
                );

                break;

        }


        /* =================================================
           UPDATE GLOBAL MUSIC PLAYER
        ================================================= */

        if (
            window.DigiCafePlayer &&
            typeof window.DigiCafePlayer.updateUI ===
            "function"
        ) {

            window.DigiCafePlayer.updateUI();

        }


        console.log(
            `☕ Opened DigiCafe room: ${page}`
        );

    }

    catch (error) {

        console.error(
            "❌ Page loading error:",
            error
        );


        content.classList.remove(
            "page-loading"
        );


        content.innerHTML = `

            <section class="page-error">

                <h2>
                    ☕ Something went wrong
                </h2>

                <p>
                    DigiCafe couldn't open this room.
                </p>

                <p>
                    ${escapeHTML(
                        error.message
                    )}
                </p>

            </section>

        `;

    }

}


/* =====================================================
   11. GLOBAL NAVIGATION
===================================================== */

function initGlobalNavigation() {

    document.addEventListener(
        "click",
        event => {

            const link =
                event.target.closest(
                    "[data-page]"
                );


            if (!link) {

                return;

            }


            /* ---------------------------------------------
               ALLOW NORMAL BROWSER BEHAVIOR
               FOR MODIFIED CLICKS
            --------------------------------------------- */

            if (
                event.ctrlKey ||
                event.metaKey ||
                event.shiftKey ||
                event.altKey ||
                event.button !== 0
            ) {

                return;

            }


            const page =
                link.dataset.page;


            if (!page) {

                return;

            }


            const story =
                link.dataset.story ||
                null;


            const chapter =
                link.dataset.chapter ||
                null;


            event.preventDefault();


            console.log(
                "🔗 DigiCafe navigation:",
                {
                    page,
                    story,
                    chapter
                }
            );


            navigateTo(
                page,
                true,
                story,
                chapter
            );

        }
    );


    console.log(
        "☕ Global navigation initialized."
    );

}


/* =====================================================
   12. NAVBAR
===================================================== */

function initNavbar() {

    const mobileMenu =
        document.getElementById(
            "mobile-menu"
        );


    const navMenu =
        document.querySelector(
            ".navbar__menu"
        );


    if (
        !mobileMenu ||
        !navMenu
    ) {

        console.warn(
            "⚠️ Navbar elements were not found."
        );

        return;

    }


    mobileMenu.setAttribute(
        "aria-expanded",
        "false"
    );


    mobileMenu.addEventListener(
        "click",
        () => {

            const isOpen =
                navMenu.classList.toggle(
                    "active"
                );


            mobileMenu.classList.toggle(
                "is-active"
            );


            mobileMenu.setAttribute(
                "aria-expanded",
                String(
                    isOpen
                )
            );

        }
    );


    console.log(
        "☕ Navbar initialized."
    );

}


/* =====================================================
   13. ACTIVE NAVIGATION
===================================================== */

function highlightActiveLink(
    currentPage
) {

    document
        .querySelectorAll(
            "[data-page]"
        )
        .forEach(
            link => {

                link.classList.remove(
                    "active"
                );


                if (
                    link.dataset.page ===
                    currentPage
                ) {

                    link.classList.add(
                        "active"
                    );

                }

            }
        );

}


/* =====================================================
   14. CLOSE MOBILE MENU
===================================================== */

function closeMobileMenu() {

    const mobileMenu =
        document.getElementById(
            "mobile-menu"
        );


    const navMenu =
        document.querySelector(
            ".navbar__menu"
        );


    if (
        !mobileMenu ||
        !navMenu
    ) {

        return;

    }


    navMenu.classList.remove(
        "active"
    );


    mobileMenu.classList.remove(
        "is-active"
    );


    mobileMenu.setAttribute(
        "aria-expanded",
        "false"
    );

}


/* =====================================================
   15. BROWSER BACK / FORWARD
===================================================== */

window.addEventListener(
    "popstate",
    async event => {

        const params =
            new URLSearchParams(
                window.location.search
            );


        const page =
            event.state?.page ||
            params.get("page") ||
            "home";


        const story =
            event.state?.story ||
            params.get("story") ||
            null;


        const chapter =
            event.state?.chapter ||
            params.get("chapter") ||
            null;


        console.log(
            "↩️ Browser navigation:",
            {
                page,
                story,
                chapter
            }
        );


        await navigateTo(
            page,
            false,
            story,
            chapter
        );

    }
);


/* =====================================================
   16. GLOBAL NAVIGATION API
===================================================== */

window.navigateTo =
    navigateTo;

/* =====================================================
   17. PLAYROOM GAME SYSTEM
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
       GAME CARDS
    ================================================= */

    const gameButtons =
        playroom.querySelectorAll(
            "[data-game]"
        );


    /* =================================================
       SHOW LOBBY
    ================================================= */

    function showPlayroomLobby() {

        console.log(
            "☕ Returning to Playroom lobby."
        );


        /* ---------------------------------------------
           Hide every game room
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
           Remove state
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
           Return to Playroom
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
           Find the requested game room
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
           Hide lounge
        --------------------------------------------- */

        if (gameLounge) {

            gameLounge.hidden = true;

        }


        /* ---------------------------------------------
           Set Playroom state
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
           Initialize game
        --------------------------------------------- */

        initializePlayroomGame(
            gameName
        );


        /* ---------------------------------------------
           Scroll to game
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
            function(event) {

                event.preventDefault();

                const gameName =
                    this.dataset.game;


                showGame(
                    gameName
                );

            }
        );

    });


    /* =================================================
       BACK TO GAMES
       ---------------------------------------------
       EVENT DELEGATION
       Works for existing and dynamically created
       buttons.
    ================================================= */

    playroom.addEventListener(
        "click",
        function(event) {

            const backButton =
                event.target.closest(
                    "[data-back-to-games]"
                );


            if (
                !backButton ||
                !playroom.contains(backButton)
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
       PUBLIC API
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
   18. INITIALIZE SELECTED GAME
===================================================== */

function initializePlayroomGame(gameName) {

    console.log(
        "🎮 Initializing game:",
        gameName
    );


    switch (gameName) {


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


        case "slots":

            if (
                typeof window.initCafeSlots ===
                "function"
            ) {

                window.initCafeSlots();

            }

            else {

                console.warn(
                    "🎰 Cafe Slots initializer not found."
                );

            }

            break;


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


        default:

            console.warn(
                `🎮 Unknown game: ${gameName}`
            );

    }

}


/* =====================================================
   19. OPEN GAME
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
   20. CLOSE GAME
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
   21. GLOBAL PLAYROOM API
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
    "☕ DigiCafe Playroom shell ready."
);


