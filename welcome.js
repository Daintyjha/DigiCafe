console.log("☕ DigiCafe Welcome Loaded");


/* =====================================================
   DIGICAFE WELCOME / ENTRANCE
===================================================== */

window.initWelcome = function () {

    const welcome =
        document.getElementById(
            "welcome-screen"
        );

    const cafe =
        document.getElementById(
            "cafe"
        );

    const enterBtn =
        document.getElementById(
            "enter-btn"
        );


    /* =================================================
       CHECK ELEMENTS
    ================================================= */

    if (
        !welcome ||
        !cafe ||
        !enterBtn
    ) {

        return;

    }


    /* =================================================
       CHECK IF VISITOR ALREADY ENTERED
    ================================================= */

    const hasVisited =
        sessionStorage.getItem(
            "digicafeVisited"
        );


    /* =================================================
       RETURNING VISITOR
    ================================================= */

    if (hasVisited) {

        welcome.style.display =
            "none";

        cafe.style.opacity =
            "1";

        return;

    }


    /* =================================================
       FIRST VISIT
    ================================================= */

    cafe.style.opacity =
        "0";


    /* =================================================
       ENTER THE CAFÉ
    ================================================= */

    enterBtn.addEventListener(
        "click",
        () => {

            /* Prevent double-clicking */

            enterBtn.disabled =
                true;


            /* Remember visitor */

            sessionStorage.setItem(
                "digicafeVisited",
                "true"
            );


            /* Start entrance animation */

            welcome.classList.add(
                "door-opening"
            );


            /* Reveal café */

            setTimeout(
                () => {

                    cafe.style.opacity =
                        "1";

                },
                700
            );


            /* Fade entrance */

            setTimeout(
                () => {

                    welcome.classList.add(
                        "exit"
                    );

                },
                850
            );


            /* Remove entrance */

            setTimeout(
                () => {

                    welcome.style.display =
                        "none";

                },
                1500
            );

        }
    );

};

