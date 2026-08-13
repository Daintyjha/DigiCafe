console.log("☕ DigiCafe Shell Loaded");


/* =====================================================
   PAGE CONFIGURATION
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
    cafeSlots: "cafe-slots.html",
    account: "account.html"

};


/* =====================================================
   READER MODULE STATE

   Reader JS is an ES module.
   It is loaded only when the Reader room opens.
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

                throw error;

            });


    await readerModuleLoading;

}


/* =====================================================
   MUSIC LOUNGE MODULE STATE

   music.html is loaded dynamically with innerHTML.

   Because scripts inside dynamically inserted HTML
   do not execute normally, music.js must be loaded
   manually by the DigiCafe shell.

   It is loaded only once, when the Music Lounge opens.
===================================================== */

let musicModuleLoaded = false;

let musicModuleLoading = null;


async function loadMusicModule() {

    /* =================================================
       ALREADY LOADED
    ================================================= */

    if (musicModuleLoaded) {

        return;

    }


    /* =================================================
       CURRENTLY LOADING
    ================================================= */

    if (musicModuleLoading) {

        await musicModuleLoading;

        return;

    }


    /* =================================================
       LOAD MUSIC.JS
    ================================================= */

    musicModuleLoading =
        new Promise(
            (resolve, reject) => {

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
   PLAYROOM GAME MODULES
===================================================== */

const gameModules = {};

async function loadGameModule(name, file) {

    if (gameModules[name]) {
        return;
    }

    if (gameModules[name + "_loading"]) {
        await gameModules[name + "_loading"];
        return;
    }

    gameModules[name + "_loading"] =
        new Promise((resolve, reject) => {

            const script =
                document.createElement("script");

            script.src = file;
            script.async = false;

            script.onload = () => {

                gameModules[name] = true;

                console.log(
                    `🎮 ${name} module loaded.`
                );

                resolve();

            };

            script.onerror = error => {

                console.error(
                    `❌ Could not load ${file}:`,
                    error
                );

                reject(
                    new Error(
                        `Could not load ${file}`
                    )
                );

            };

            document.body.appendChild(script);

        });

    await gameModules[name + "_loading"];
}


/* =====================================================
   LOAD PLAYROOM GAMES
===================================================== */

async function loadPlayroomGameModules() {

    try {

        await loadGameModule(
            "solitaire",
            "solitaire.js"
        );

    } catch (error) {

        console.error(
            "❌ Solitaire module failed:",
            error
        );

    }


    try {

        await loadGameModule(
            "slots",
            "cafe-slots.js"
        );

    } catch (error) {

        console.error(
            "❌ Café Slots module failed:",
            error
        );

    }


    try {

        await loadGameModule(
            "bingo",
            "bingo.js"
        );

    } catch (error) {

        console.error(
            "❌ Bingo module failed:",
            error
        );

    }


    try {

        await loadGameModule(
            "chess",
            "chess.js"
        );

    } catch (error) {

        console.error(
            "❌ Chess module failed:",
            error
        );

    }


    try {

        await loadGameModule(
            "dama",
            "dama.js"
        );

    } catch (error) {

        console.error(
            "❌ Dama module failed:",
            error
        );

    }

}
/* =====================================================
   START DIGICAFE
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log(
            "☕ Starting DigiCafe shell..."
        );


        /* =================================================
           LOAD GLOBAL COMPONENTS FIRST
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

        } else {

            console.error(
                "❌ initMusicPlayer() was not found."
            );

        }


        /* =================================================
           INITIALIZE NAVBAR
        ================================================= */

        initNavbar();


        /* =================================================
           INITIALIZE GLOBAL ROOM NAVIGATION
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
   COMPONENT LOADER
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

    } catch (error) {

        console.error(
            `❌ Could not load ${file}:`,
            error
        );


        return false;

    }

}


/* =====================================================
   LOAD INITIAL PAGE
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

        page = "home";

    }


    if (!pages[page]) {

        page = "home";

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
   LIBRARY CONTENT RENDERER
   -----------------------------------------------------
   Blog and Discussion content come from stories.js.

   stories.js creates:

       window.STORIES

   This function reads the entries and creates
   clickable links inside:

       #blogList
       #discussionList
===================================================== */

window.initLibrary = async function () {

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


    /* =================================================
       CHECK STORY DATABASE
    ================================================= */

    if (
        !window.STORIES
    ) {

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


    /* =================================================
       CLEAR EXISTING CONTENT
    ================================================= */

    if (blogList) {

        blogList.innerHTML = "";

    }


    if (discussionList) {

        discussionList.innerHTML = "";

    }


    /* =================================================
       TRACK CONTENT
    ================================================= */

    let blogCount =
        0;


    let discussionCount =
        0;


    /* =================================================
       LOOP THROUGH STORIES
    ================================================= */

    Object.entries(
        window.STORIES
    ).forEach(
        ([storyKey, story]) => {

            if (!story) {

                return;

            }


            const contentType =
                story.type || "novel";


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


    /* =================================================
       EMPTY STATES
    ================================================= */

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
   ESCAPE HTML
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
   FORMAT PUBLISHED DATE
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
   NAVIGATION
===================================================== */

async function navigateTo(
    page,
    updateHistory = true,
    story = null,
    chapter = null
) {

    /* =================================================
       CHECK PAGE
    ================================================= */

    if (!pages[page]) {

        console.warn(
            `⚠️ Unknown page "${page}". Returning home.`
        );

        page = "home";

    }


    /* =================================================
       FIND CONTENT AREA
    ================================================= */

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

        /* =================================================
           SHOW LOADING STATE
        ================================================= */

        content.classList.add(
            "page-loading"
        );


        /* =================================================
           LOAD ROOM
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


        /* =================================================
           INSERT ROOM
        ================================================= */

        content.innerHTML =
            html;

/* =================================================
   PLAYROOM GAMES
   -------------------------------------------------
   Universal DigiCafe game initialization
   -------------------------------------------------
   Games:
   • Solitaire
   • Café Slots
   • Bingo
   • Chess
   • Dama
================================================= */

if (page === "playroom") {

    await loadPlayroomGameModules();

    setupPlayroomGames();


    /* =================================================
       SOLITAIRE
    ================================================= */

    if (
        typeof initSolitaire === "function"
    ) {

        initSolitaire();

    } else {

        console.warn(
            "🃏 Solitaire JS is not loaded yet."
        );

    }


    /* =================================================
       CAFÉ SLOTS
    ================================================= */

    if (
        typeof initCafeSlots === "function"
    ) {

        initCafeSlots();

    } else {

        console.warn(
            "☕🎰 Café Slots JS is not loaded yet."
        );

    }


    /* =================================================
       BINGO
    ================================================= */

    if (
        typeof initBingo === "function"
    ) {

        initBingo();

    } else {

        console.warn(
            "🎱 Bingo JS is not loaded yet."
        );

    }


    /* =================================================
       CHESS
    ================================================= */

    if (
        typeof initChess === "function"
    ) {

        initChess();

    } else {

        console.log(
            "♟️ Chess JS is not loaded yet."
        );

    }


    /* =================================================
       DAMA
    ================================================= */

    if (
        typeof initDama === "function"
    ) {

        initDama();

    } else {

        console.log(
            "🀄 Dama JS is not loaded yet."
        );

    }

}
        /* =================================================
           STORE CURRENT READER STORY
        ================================================= */

        if (
            page === "reader"
        ) {

            window.currentReaderStory =
                story;

        } else {

            window.currentReaderStory =
                null;

        }


        /* =================================================
           REMOVE LOADING STATE
        ================================================= */

        content.classList.remove(
            "page-loading"
        );


        /* =================================================
           UPDATE URL
        ================================================= */

        if (updateHistory) {

            let url;


            if (
                page === "home"
            ) {

                url =
                    "index.html";

            }


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


            else {

                url =
                    `index.html?page=${encodeURIComponent(
                        page
                    )}`;

            }


            window.history.pushState(
                {
                    page: page,

                    story: story,

                    chapter: chapter

                },
                "",
                url
            );

        }


        /* =================================================
           UPDATE ACTIVE NAV
        ================================================= */

        highlightActiveLink(
            page
        );


        /* =================================================
           CLOSE MOBILE MENU
        ================================================= */

        closeMobileMenu();


        /* =================================================
           UPDATE BESHY ROOM
        ================================================= */

        document.body.dataset.beshyPage =
            page;


        /* =================================================
           ROOM INITIALIZATION
        ================================================= */

        switch (page) {


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


                /* -----------------------------------------
                   Load music.js
                ----------------------------------------- */

                try {

                    await loadMusicModule();

                } catch (error) {

                    console.error(
                        "❌ Music Lounge module failed:",
                        error
                    );

                    break;

                }


                /* -----------------------------------------
                   Initialize Music Lounge
                ----------------------------------------- */

                if (
                    typeof window.initMusicLounge ===
                    "function"
                ) {

                    await window.initMusicLounge();

                } else {

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

                } else {

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


                /* -----------------------------------------
                   LOAD READER MODULE
                ----------------------------------------- */

                await loadReaderModule();


                /* -----------------------------------------
                   INITIALIZE READER
                ----------------------------------------- */

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

                } else {

                    console.error(
                        "❌ initReader() was not found after loading reader.js."
                    );

                }

                break;

/* =====================================================
   PLAYROOM GAME MODULE LOADER
===================================================== */

const gameModules = {

    solitaire: "solitaire.js",
    slots: "cafe-slots.js",
    bingo: "bingo.js",
    chess: "chess.js",
    dama: "dama.js"

};

const loadedGameModules = {};
const loadingGameModules = {};


async function loadGameModule(gameName) {

    const file =
        gameModules[gameName];

    if (!file) {

        console.warn(
            `🎮 No JS module registered for "${gameName}".`
        );

        return false;

    }


    /* Already loaded */

    if (
        loadedGameModules[gameName]
    ) {

        return true;

    }


    /* Currently loading */

    if (
        loadingGameModules[gameName]
    ) {

        await loadingGameModules[gameName];

        return true;

    }


    console.log(
        `🎮 Loading ${gameName} module...`
    );


    loadingGameModules[gameName] =
        new Promise(
            (resolve, reject) => {

                const script =
                    document.createElement(
                        "script"
                    );


                script.src =
                    file;


                script.async =
                    false;


                script.onload =
                    () => {

                        loadedGameModules[gameName] =
                            true;

                        console.log(
                            `✅ ${file} loaded.`
                        );

                        resolve();

                    };


                script.onerror =
                    error => {

                        console.error(
                            `❌ Could not load ${file}:`,
                            error
                        );

                        reject(
                            new Error(
                                `Could not load ${file}`
                            )
                        );

                    };


                document.body.appendChild(
                    script
                );

            }
        );


    try {

        await loadingGameModules[gameName];

        return true;

    } catch (error) {

        delete loadingGameModules[gameName];

        return false;

    }

}
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

        }


        /* =================================================
           UPDATE MUSIC PLAYER UI
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


    } catch (error) {

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
   GLOBAL NAVIGATION
   -----------------------------------------------------
   Event delegation means links created later
   inside dynamically loaded rooms will still work.
===================================================== */

function initGlobalNavigation() {

    document.addEventListener(
        "click",
        event => {

            /* ---------------------------------------------
               Find nearest navigation element
            --------------------------------------------- */

            const link =
                event.target.closest(
                    "[data-page]"
                );


            if (!link) {

                return;

            }


            /* ---------------------------------------------
               Ignore modified clicks
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


            /* ---------------------------------------------
               Get page
            --------------------------------------------- */

            const page =
                link.dataset.page;


            if (!page) {

                return;

            }


            /* ---------------------------------------------
               Get story
            --------------------------------------------- */

            const story =
                link.dataset.story ||
                null;


            /* ---------------------------------------------
               Get chapter
            --------------------------------------------- */

            const chapter =
                link.dataset.chapter ||
                null;


            /* ---------------------------------------------
               Prevent normal browser navigation
            --------------------------------------------- */

            event.preventDefault();


            console.log(
                "🔗 DigiCafe navigation:",
                {
                    page,
                    story,
                    chapter
                }
            );


            /* ---------------------------------------------
               Navigate
            --------------------------------------------- */

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
   NAVBAR
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


    /* =================================================
       INITIAL STATE
    ================================================= */

    mobileMenu.setAttribute(
        "aria-expanded",
        "false"
    );


    /* =================================================
       HAMBURGER
    ================================================= */

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
   ACTIVE NAVIGATION
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
   MOBILE MENU CLOSE
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
   BROWSER BACK / FORWARD
===================================================== */

window.addEventListener(
    "popstate",
    async event => {

        const params =
            new URLSearchParams(
                window.location.search
            );


        /* ---------------------------------------------
           Get page
        --------------------------------------------- */

        const page =
            event.state?.page ||
            params.get("page") ||
            "home";


        /* ---------------------------------------------
           Get story
        --------------------------------------------- */

        const story =
            event.state?.story ||
            params.get("story") ||
            null;


        /* ---------------------------------------------
           Get chapter
        --------------------------------------------- */

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
   GLOBAL NAVIGATION API
===================================================== */

window.navigateTo =
    navigateTo;
/* /* =========================================================
   PLAYROOM GAME NAVIGATION
   ---------------------------------------------------------
   Universal navigation for all DigiCafe games.

   Supported games:
   • Solitaire
   • Café Slots
   • Bingo
   • Chess
   • Dama

   The HTML only needs:

       data-game="game-name"

   and:

       data-game-room="game-name"

   Future games can use the same system.
========================================================= */


/* =========================================================
   SETUP PLAYROOM GAMES
========================================================= */

function setupPlayroomGames() {

    const playroom =
        document.querySelector(".playroom");


    if (!playroom) {

        console.warn(
            "🎮 Playroom not found."
        );

        return;

    }


    /* =====================================================
       GAME BUTTONS
    ===================================================== */

    playroom
        .querySelectorAll("[data-game]")
        .forEach(button => {

            /*
                Prevent duplicate event listeners
                when the Playroom is loaded again.
            */

            if (
                button.dataset.gameNavigationBound ===
                "true"
            ) {

                return;

            }


            button.dataset.gameNavigationBound =
                "true";


            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();


                    const gameName =
                        button.dataset.game;


                    if (!gameName) {

                        console.warn(
                            "🎮 Game button has no data-game:",
                            button
                        );

                        return;

                    }


                    openPlayroomGame(
                        gameName
                    );

                }
            );

        });


    /* =====================================================
       BACK TO GAMES BUTTONS
    ===================================================== */

    playroom
        .querySelectorAll("[data-back-to-games]")
        .forEach(button => {

            /*
                Prevent duplicate listeners.
            */

            if (
                button.dataset.backNavigationBound ===
                "true"
            ) {

                return;

            }


            button.dataset.backNavigationBound =
                "true";


            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();


                    closePlayroomGame();

                }
            );

        });


    console.log(
        "🎮 DigiCafe Playroom navigation ready."
    );

}


/* =========================================================
   OPEN GAME
========================================================= */

function openPlayroomGame(
    gameName
) {

    const playroom =
        document.querySelector(".playroom");


    if (!playroom) {

        return;

    }


    console.log(
        "🎮 Opening game:",
        gameName
    );


    /* =====================================================
       HIDE GAME CARDS
    ===================================================== */

    playroom
        .querySelectorAll(".game-card")
        .forEach(card => {

            card.style.display =
                "none";

        });


    /* =====================================================
       HIDE ALL GAME ROOMS
    ===================================================== */

    playroom
        .querySelectorAll(".game-room")
        .forEach(room => {

            room.hidden =
                true;

        });


    /* =====================================================
       FIND SELECTED GAME ROOM
    ===================================================== */

    const gameRoom =
        playroom.querySelector(
            `[data-game-room="${gameName}"]`
        );


    if (!gameRoom) {

        console.warn(
            "🎮 Game room not found:",
            gameName
        );


        /*
            Restore cards if the room
            doesn't exist.
        */

        playroom
            .querySelectorAll(".game-card")
            .forEach(card => {

                card.style.display =
                    "";

            });


        return;

    }


    /* =====================================================
       SHOW GAME ROOM
    ===================================================== */

    gameRoom.hidden =
        false;


    /* =====================================================
       OPTIONAL GAME INITIALIZATION
       -----------------------------------------------------
       If the game has an initializer, run it now.

       This means games can safely be opened even
       when their JS is loaded separately.
    ===================================================== */
/* =====================================================
   LOAD GAME MODULE
===================================================== */

loadGameModule(gameName)
    .then(() => {

        /* =================================================
           INITIALIZE GAME
        ================================================= */

        switch (gameName) {

            case "solitaire":

                if (
                    typeof initSolitaire ===
                    "function"
                ) {

                    initSolitaire();

                } else {

                    console.error(
                        "❌ initSolitaire() was not found."
                    );

                }

                break;


            case "slots":

                if (
                    typeof initCafeSlots ===
                    "function"
                ) {

                    initCafeSlots();

                } else {

                    console.error(
                        "❌ initCafeSlots() was not found."
                    );

                }

                break;


            case "bingo":

                if (
                    typeof initBingo ===
                    "function"
                ) {

                    initBingo();

                } else {

                    console.error(
                        "❌ initBingo() was not found."
                    );

                }

                break;


            case "chess":

                if (
                    typeof initChess ===
                    "function"
                ) {

                    initChess();

                } else {

                    console.error(
                        "❌ initChess() was not found."
                    );

                }

                break;


            case "dama":

                if (
                    typeof initDama ===
                    "function"
                ) {

                    initDama();

                } else {

                    console.error(
                        "❌ initDama() was not found."
                    );

                }

                break;

        }

    })
    .catch(error => {

        console.error(
            `❌ Could not initialize ${gameName}:`,
            error
        );

    });
    /* =====================================================
       SCROLL TO GAME
    ===================================================== */

    gameRoom.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });


    console.log(
        "🎮 Opened:",
        gameName
    );

}


/* =========================================================
   BACK TO PLAYROOM
========================================================= */

function closePlayroomGame() {

    const playroom =
        document.querySelector(".playroom");


    if (!playroom) {

        return;

    }


    /* =====================================================
       HIDE ALL GAME ROOMS
    ===================================================== */

    playroom
        .querySelectorAll(".game-room")
        .forEach(room => {

            room.hidden =
                true;

        });


    /* =====================================================
       SHOW GAME CARDS
    ===================================================== */

    playroom
        .querySelectorAll(".game-card")
        .forEach(card => {

            card.style.display =
                "";

        });


    /* =====================================================
       RETURN TO GAME LOUNGE
    ===================================================== */

    const gameLounge =
        playroom.querySelector(
            ".game-lounge"
        );


    if (gameLounge) {

        gameLounge.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }


    console.log(
        "🎮 Back to Playroom."
    );

}
