document.addEventListener("DOMContentLoaded", async () => {

    async function loadComponent(id, file) {
        const element = document.getElementById(id);

        if (!element) return;

        try {
            const response = await fetch(file);

            if (!response.ok) {
                throw new Error(`Failed to load ${file}: ${response.status}`);
            }

            element.innerHTML = await response.text();

        } catch (error) {
            console.error(`Component loading error:`, error);
        }
    }

    await loadComponent("navbar", "navbar.html");
    await loadComponent("footer", "footer.html");

    initNavbar();
    highlightActiveLink();
});


/* =====================================================
   MOBILE NAVBAR
===================================================== */

function initNavbar() {

    const mobileMenu = document.getElementById("mobile-menu");
    const navMenu = document.querySelector(".navbar__menu");

    if (!mobileMenu || !navMenu) return;

    mobileMenu.setAttribute("aria-expanded", "false");

    mobileMenu.addEventListener("click", () => {

        const isOpen = navMenu.classList.toggle("active");

        mobileMenu.classList.toggle("is-active");

        mobileMenu.setAttribute("aria-expanded", isOpen);

    });


    document.querySelectorAll(".navbar__menu a").forEach(link => {

        link.addEventListener("click", () => {

            navMenu.classList.remove("active");
            mobileMenu.classList.remove("is-active");

            mobileMenu.setAttribute("aria-expanded", "false");

        });

    });
}


/* =====================================================
   ACTIVE NAVIGATION LINK
===================================================== */

function highlightActiveLink() {

    const currentPage =
        window.location.pathname.split("/").pop() || "index.html";

    document.querySelectorAll(".navbar__links").forEach(link => {

        const href = link.getAttribute("href");

        if (href === currentPage) {
            link.classList.add("active");
        }

    });
}
