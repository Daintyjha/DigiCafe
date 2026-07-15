// =============================
// COMPONENT LOADER (NAV + FOOTER)
// =============================

document.addEventListener("DOMContentLoaded", async () => {

  async function loadComponent(id, file) {
    const res = await fetch(file);
    const html = await res.text();
    document.getElementById(id).innerHTML = html;
  }

  // Load components first
  await loadComponent("navbar", "navbar.html");
  await loadComponent("footer", "footer.html");

  // Initialize after injection
  initNavbar();
  highlightActiveLink();
});


// =============================
// NAVBAR FUNCTIONALITY
// =============================
document.addEventListener("DOMContentLoaded", async () => {

  const navHTML = await fetch("navbar.html").then(r => r.text());
  document.getElementById("navbar").innerHTML = navHTML;

  const footerHTML = await fetch("footer.html").then(r => r.text());
  document.getElementById("footer").innerHTML = footerHTML;

  initNavbar(); // MUST run AFTER injection
});
function initNavbar() {

  const mobileMenu = document.getElementById("mobile-menu");
  const navMenu = document.querySelector(".navbar__menu");

  if (!mobileMenu || !navMenu) {
    console.log("Navbar elements not found");
    return;
  }

  console.log("Navbar initialized");

  mobileMenu.addEventListener("click", () => {
    navMenu.classList.toggle("active");
    mobileMenu.classList.toggle("is-active");
  });

  document.querySelectorAll(".navbar__menu a").forEach(link => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("active");
      mobileMenu.classList.remove("is-active");
    });
  });
}

// =============================
// ACTIVE LINK HIGHLIGHT
// =============================
function highlightActiveLink() {

  const currentPage = window.location.pathname.split("/").pop();

  document.querySelectorAll(".navbar__links").forEach(link => {
    const href = link.getAttribute("href");

    if (href === currentPage) {
      link.classList.add("active");
    }
  });
}
document.addEventListener("DOMContentLoaded", async () => {

  try {
    const nav = await fetch("navbar.html");
    document.getElementById("navbar").innerHTML = await nav.text();

    const foot = await fetch("footer.html");
    document.getElementById("footer").innerHTML = await foot.text();

    initNavbar();
    highlightActiveLink();

  } catch (err) {
    console.error("Navbar/Footer failed to load:", err);
  }

});
