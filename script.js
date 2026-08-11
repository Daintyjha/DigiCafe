
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

    account: "account.html"

};


/* =====================================================
   READER MODULE STATE

   Reader JS is an ES module.
   We load it only when the Reader room is opened.

   IMPORTANT:
   If your reader JavaScript file has another name,
   change "./reader.js" below.
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
            "beshy.html"
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

           IMPORTANT:

           We use EVENT DELEGATION here.

           This means links created later inside:
           - romance.html
           - comedy.html
           - scifi.html
           - library.html
           - reader.html

           will still work.
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

           IMPORTANT:
           Only insert ONCE.
        ================================================= */

        content.innerHTML =
            html;


        /* =================================================
           STORE CURRENT READER STORY
        ================================================= */

        if (page === "reader") {

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


            if (page === "home") {

                url =
                    "index.html";

            }


            else if (page === "reader") {

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

                if (
                    typeof window.initMusicLounge ===
                    "function"
                ) {

                    await window.initMusicLounge();

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

           Music cards may have been created
           by the room.
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
                    ${error.message}
                </p>

            </section>

        `;

    }

}


/* =====================================================
   GLOBAL NAVIGATION
   -----------------------------------------------------
   IMPORTANT:

   This uses EVENT DELEGATION.

   Do NOT attach click listeners individually
   to room links because room HTML is loaded
   dynamically after the shell starts.
===================================================== */

function initGlobalNavigation() {

    document.addEventListener(
        "click",
        event => {

            /* ---------------------------------------------
               Find the nearest navigation element
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

               This allows:
               Ctrl + Click
               Cmd + Click
               Shift + Click
               Middle-click
               to behave normally.
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

               DigiCafe will load the room instead.
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

