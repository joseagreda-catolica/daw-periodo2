
const nav = document.getElementById('nav-website');
const footer = document.getElementById('footer-website');

startApp();

async function startApp() {

    await loadNavFooter();

};

async function loadNavFooter() {
    // traer archivos de NavFooter
    const navbarTmpl = await fetch('/templates/navbar.html');
    const footerTmpl = await fetch('/templates/footer.html');

    nav.innerHTML = await navbarTmpl.text();
    footer.innerHTML = await footerTmpl.text();
};