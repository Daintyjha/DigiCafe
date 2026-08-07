document.addEventListener("DOMContentLoaded",async()=>{
async function loadComponent(id,file){
const element=document.getElementById(id);
if(!element)return;
const response=await fetch(file);
element.innerHTML=await response.text();
}
await loadComponent("navbar","navbar.html");
await loadComponent("footer","footer.html");
initNavbar();
highlightActiveLink();
});

function initNavbar(){
const mobileMenu=document.getElementById("mobile-menu");
const navMenu=document.querySelector(".navbar__menu");
if(!mobileMenu||!navMenu)return;
mobileMenu.addEventListener("click",()=>{
navMenu.classList.toggle("active");
mobileMenu.classList.toggle("is-active");
});
document.querySelectorAll(".navbar__menu a").forEach(link=>{
link.addEventListener("click",()=>{
navMenu.classList.remove("active");
mobileMenu.classList.remove("is-active");
});

function highlightActiveLink(){
const currentPage=window.location.pathname.split("/").pop()||"index.html";
document.querySelectorAll(".navbar__links").forEach(link=>{
const href=link.getAttribute("href");
if(href===currentPage)link.classList.add("active");
});
const welcome = document.getElementById("welcome-screen");
const cafe = document.getElementById("cafe");
const enterBtn = document.getElementById("enter-btn");

cafe.style.opacity = "0";

enterBtn.addEventListener("click", () => {

    cafe.style.opacity = "1";

    welcome.style.opacity = "0";

    setTimeout(() => {

        welcome.style.display = "none";

    }, 800);

});
}

