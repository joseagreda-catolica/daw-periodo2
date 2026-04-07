
const nav = document.getElementById('nav-website');
const footer = document.getElementById('footer-website');

startApp();

async function startApp() {
    await loadNavFooter();
    await updateNavAuth();
}

async function loadNavFooter() {
    const navbarTmpl = await fetch('/templates/navbar.html');
    const footerTmpl = await fetch('/templates/footer.html');

    nav.innerHTML = await navbarTmpl.text();
    if (footer) footer.innerHTML = await footerTmpl.text();
}

async function updateNavAuth() {
    try {
        const res = await fetch('/api/auth/check-session', { credentials: 'include' });
        const data = await res.json();
        const authArea = document.getElementById('nav-auth-area');
        if (!authArea) return;

        if (data.logged) {
            const u = data.user;
            let profileLink = '/usuario/usuario.html';
            if (u.rol === 'empresa') profileLink = '/comunidad_recursos/empresa.html';
            if (u.rol === 'admin')   profileLink = '/admin/admin.html';

            authArea.innerHTML = `
                <a href="${profileLink}" class="text-decoration-none fw-semibold">Hola, ${u.nombre}</a>
                <a href="/auth/logout" class="btn btn-outline-secondary btn-sm">Cerrar Sesión</a>
            `;
        } else {
            authArea.innerHTML = `<a class="btn btn-warning" href="/usuario/usuario-login.html">Ingresar</a>`;
        }
    } catch (e) {
        // silently fail — session check is best-effort
    }
}
