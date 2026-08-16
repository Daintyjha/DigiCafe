console.log("☕ DigiCafe Shell Loaded");


/* =========================================================
   DIGICAFE MAIN SHELL
   ---------------------------------------------------------
   Handles:

   • Global page navigation
   • Dynamic room loading
   • Navbar
   • Mobile menu
   • Reader loading
   • Music Lounge loading
   • Library rendering
   • Playroom module loading
   • Browser back / forward navigation

   PLAYROOM GAME LOGIC IS NOT HERE.

   Playroom navigation:
   • playroom.js

   Games:
   • solitaire.js
   • bingo.js
   • slots.js
   • chess.js
   • dama.js
========================================================= */


/* =========================================================
   01. PAGE CONFIGURATION
========================================================= */

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


/* =========================================================
   02. READER MODULE
========================================================= */

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

                readerModuleLoaded = true;

                console.log(
                    "📖 Reader module loaded."
                );

            })
            .catch(error => {

                console.error(
                    "❌ Could not load reader.js:",
                    error
                );

                readerModuleLoading = null;

                throw error;

            });


    await readerModuleLoading;

}


/* =========================================================
   03. MUSIC LOUNGE MODULE
========================================================= */

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

                    musicModuleLoaded = true;

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


                script.src = "music.js";

                script.async = false;


                script.onload = () => {

                    musicModuleLoaded = true;

                    console.log(
                        "🎵 Music Lounge module loaded."
                    );

                    resolve();

                };


                script.onerror = error => {

                    console.error(
                        "❌ Could not load music.js:",
                        error
                    );

                    musicModuleLoading = null;

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


/* =========================================================
   04. PLAYROOM MODULE
========================================================= */

let playroomModuleLoaded = false;

let playroomModuleLoading = null;


async function loadPlayroomModule() {

    if (playroomModuleLoaded) {

        return;

    }


    if (playroomModuleLoading) {

        await playroomModuleLoading;

        return;

    }


    playroomModuleLoading =
        new Promise(
            (resolve, reject) => {

                const existingScript =
                    document.querySelector(
                        'script[src="playroom.js"]'
                    );


                /* -----------------------------------------
                   SCRIPT ALREADY EXISTS
                ----------------------------------------- */

                if (existingScript) {

                    playroomModuleLoaded = true;

                    console.log(
                        "🎮 Playroom script already loaded."
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


                script.src = "playroom.js";

                script.async = false;


                script.onload = () => {

                    playroomModuleLoaded = true;

                    console.log(
                        "🎮 Playroom module loaded."
                    );

                    resolve();

                };


                script.onerror = error => {

                    console.error(
                        "❌ Could not load playroom.js:",
                        error
                    );

                    playroomModuleLoading = null;

                    reject(
                        new Error(
                            "Could not load playroom.js"
                        )
                    );

                };


                document.body.appendChild(
                    script
                );

            }
        );


    await playroomModuleLoading;

}


/* =========================================================
   05. DIGICAFE STARTUP
========================================================= */

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


/* =========================================================
   06. COMPONENT LOADER
========================================================= */

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


/* =========================================================
   07. INITIAL PAGE
========================================================= */

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


/* =========================================================
   08. LIBRARY
========================================================= */

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

            blogList.innerHTML = "";

        }


        if (discussionList) {

            discussionList.innerHTML = "";

        }


        let blogCount = 0;

        let discussionCount = 0;


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


                    link.href = "#";

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


                    link.href = "#";

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


/* =========================================================
   09. ESCAPE HTML
========================================================= */

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


/* =========================================================
   10. FORMAT PUBLISHED DATE
========================================================= */

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


/* =========================================================
   11. MAIN NAVIGATION
========================================================= */

async function navigateTo(
    page,
    updateHistory = true,
    story = null,
    chapter = null
) {

    /* -----------------------------------------------------
       Validate page
    ----------------------------------------------------- */

    if (!pages[page]) {

        console.warn(
            `⚠️ Unknown page "${page}". Returning home.`
        );

        page = "home";

    }


    /* -----------------------------------------------------
       Find page container
    ----------------------------------------------------- */

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


        /* =================================================
           PLAYROOM MODULE

           The HTML must be loaded first.

           Then playroom.js is loaded.
        ================================================= */

        if (
            page === "playroom"
        ) {

            try {

                await loadPlayroomModule();

            }

            catch (error) {

                console.error(
                    "❌ Playroom module failed:",
                    error
                );

            }

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


            /* ---------------------------------------------
               HOME
            --------------------------------------------- */

            if (
                page === "home"
            ) {

                url = "index.html";

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
           BESHY PAGE STATE
        ================================================= */

        document.body.dataset.beshyPage =
            page;


        /* =================================================
           ROOM INITIALIZATION
        ================================================= */

        switch (page) {


            /* =============================================
               HOME
            ============================================== */

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
            ============================================== */

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
            ============================================== */

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
            ============================================== */

            case "romance":

                console.log(
                    "💗 Opening Romance"
                );

                break;


            /* =============================================
               COMEDY
            ============================================== */

            case "comedy":

                console.log(
                    "😂 Opening Comedy"
                );

                break;


            /* =============================================
               SCI-FI
            ============================================== */

            case "scifi":

                console.log(
                    "🚀 Opening Sci-Fi"
                );

                break;


            /* =============================================
               READER
            ============================================== */

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
            ============================================== */

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
            ============================================== */

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
            ============================================== */

            case "playroom":

                console.log(
                    "🎮 DigiCafe Playroom ready."
                );


                if (
                    typeof window.setupPlayroomGames ===
                    "function"
                ) {

                    window.setupPlayroomGames();

                }

                else {

                    console.error(
                        "❌ setupPlayroomGames() was not found."
                    );

                }

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


/* =========================================================
   12. GLOBAL NAVIGATION
========================================================= */

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
               Allow modified clicks
               Ctrl / Cmd / Shift / Alt
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


/* =========================================================
   13. NAVBAR
========================================================= */

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


/* =========================================================
   14. ACTIVE NAVIGATION
========================================================= */

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


/* =========================================================
   15. CLOSE MOBILE MENU
========================================================= */

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


/* =========================================================
   16. BROWSER BACK / FORWARD
========================================================= */

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


/* =========================================================
   17. GLOBAL NAVIGATION API
========================================================= */

window.navigateTo =
    navigateTo;


/* =========================================================
   18. GLOBAL SHELL API
========================================================= */

window.loadComponent =
    loadComponent;


window.loadMusicModule =
    loadMusicModule;


window.loadReaderModule =
    loadReaderModule;


window.loadPlayroomModule =
    loadPlayroomModule;


/* =========================================================
   19. SHELL READY
========================================================= */

console.log(
    "☕ DigiCafe shell script ready."
);
