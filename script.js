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
   START DIGICAFE
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log("☕ Starting DigiCafe shell...");


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

           IMPORTANT:
           music-player.html MUST already exist
           before music-player.js is initialized.
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


    if (!page) {

        page = "home";

    }


    if (!pages[page]) {

        page = "home";

    }


    await navigateTo(
        page,
        false
    );

}


/* =====================================================
   NAVIGATION
===================================================== */

async function navigateTo(
    page,
    updateHistory = true,
    story = null
) {

    /* =================================================
       CHECK PAGE
    ================================================= */

    if (!pages[page]) {

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


        content.classList.remove(
            "page-loading"
        );


        /* =================================================
           UPDATE URL
        ================================================= */

        if (updateHistory) {

             let url;

if (page === "home") {

    url = "index.html";

} else if (
    page === "reader" &&
    story
) {

    url =
        `index.html?page=reader&story=${encodeURIComponent(story)}`;

} else {

    url =
        `index.html?page=${page}`;

}

            window.history.pushState(
                {
                    page: page
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

            case "home":

                if (
                    typeof window.initWelcome ===
                    "function"
                ) {

                    window.initWelcome();

                }

                break;


            case "music":

                if (
                    typeof window.initMusicLounge ===
                    "function"
                ) {

                    await window.initMusicLounge();

                }

                break;


            case "library":

                if (
                    typeof window.initLibrary ===
                    "function"
                ) {

                    window.initLibrary();

                }

                break;


            case "about":

                if (
                    typeof window.initAbout ===
                    "function"
                ) {

                    window.initAbout();

                }

                break;


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
           UPDATE PLAYER INDICATORS

           Music cards may have just been created.
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

            </section>

        `;

    }

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


    /* =================================================
       NAVIGATION LINKS
    ================================================= */

    document
    .querySelectorAll(
       ".navbar__links, .library-room-link, [data-page]"
        )
        .forEach(
            link => {

                link.addEventListener(
                    "click",
                    event => {

                        const page =
                            link.dataset.page;
const story =
    link.dataset.story || null;

                        if (!page) {

                            return;

                        }


                        event.preventDefault();


                        navigateTo(
                            page
                        );

                    }
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
            ".navbar__links"
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
    event => {

        const page =
            event.state?.page ||
            new URLSearchParams(
                window.location.search
            ).get("page") ||
            "home";


        navigateTo(
            page,
            false
        );

    }
);


/* =====================================================
   GLOBAL NAVIGATION API
===================================================== */

window.navigateTo =
    navigateTo;
