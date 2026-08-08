document.addEventListener("DOMContentLoaded", () => {

    const welcome = document.getElementById("welcome-screen");
    const cafe = document.getElementById("cafe");
    const enterBtn = document.getElementById("enter-btn");

    if (!welcome || !cafe || !enterBtn) return;


    /* =====================================================
       CHECK IF VISITOR ALREADY ENTERED
    ===================================================== */

    const hasVisited = sessionStorage.getItem("digicafeVisited");


    /* =====================================================
       RETURNING VISITOR
    ===================================================== */

    if (hasVisited) {

        welcome.style.display = "none";
        cafe.style.opacity = "1";

        return;
    }


    /* =====================================================
       FIRST VISIT
    ===================================================== */

    cafe.style.opacity = "0";


    /* =====================================================
       ENTER THE CAFÉ
    ===================================================== */

    enterBtn.addEventListener("click", () => {

        /* Prevent double-clicking */
        enterBtn.disabled = true;


        /* Remember that the visitor entered */
        sessionStorage.setItem("digicafeVisited", "true");


        /* Start the café entrance animation */
        welcome.classList.add("door-opening");


        /*
         * Give the door a moment to open
         * before revealing the Lobby.
         */
        setTimeout(() => {

            cafe.style.opacity = "1";

        }, 700);


        /*
         * Fade the entrance away.
         */
        setTimeout(() => {

            welcome.classList.add("exit");

        }, 850);


        /*
         * Remove the entrance completely
         * after the animation finishes.
         */
        setTimeout(() => {

            welcome.style.display = "none";

        }, 1500);

    });

});
