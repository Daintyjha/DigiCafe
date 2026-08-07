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


    enterBtn.addEventListener("click", () => {

        // Remember that the visitor entered
        sessionStorage.setItem("digicafeVisited", "true");

        // Reveal the café
        cafe.style.opacity = "1";

        // Fade out welcome screen
        welcome.style.opacity = "0";


        // Remove welcome screen after animation
        setTimeout(() => {

            welcome.style.display = "none";

        }, 800);

    });

});
