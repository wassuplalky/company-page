// fungsi untuk hamburger menu
function myFunction (x) {
    x.classList.toggle("change");
    const menu = document.getElementById('menu');
    menu.classList.toggle('active');
    
    const bars = document.querySelectorAll('.bar1, .bar2, .bar3');
    bars.forEach(bar => {
        bar.classList.toggle("change");
    });
}

// fungsi untuk dropdown foto profil dan ambil data (localstorage)
const profileIcon = document.getElementById("profile-icon");
const dropdownMenu = document.getElementById("dropdown-menu");
const savedImg = localStorage.getItem("profilePhoto");

profileIcon.addEventListener("click", () => {
    dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block";
});

document.addEventListener("click", (e) => {
    if (!profileIcon.contains(e.target) && !dropdownMenu.contains(e.target)) {
        dropdownMenu.style.display = "none";
    }
}); 

// fungsi untuk ambil data dari localstorage
window.addEventListener("DOMContentLoaded", () => {
    if (savedImg && profileIcon) {
        profileIcon.src = savedImg;
    }
});