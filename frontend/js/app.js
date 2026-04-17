
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

    if (nav) nav.innerHTML = await navbarTmpl.text();
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

            const initials = u.nombre ? u.nombre[0].toUpperCase() : '?';
            authArea.innerHTML = `
                <a href="${profileLink}" class="d-flex align-items-center gap-2 text-decoration-none">
                    <div style="width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.2);
                                border:2px solid rgba(255,255,255,0.4);display:flex;align-items:center;
                                justify-content:center;font-size:0.8rem;font-weight:700;color:#fff;">
                        ${initials}
                    </div>
                    <span class="text-white fw-semibold" style="font-size:0.875rem;">Hola, ${u.nombre}</span>
                </a>
                <a href="/auth/logout" class="btn btn-sm rounded-pill px-3 fw-semibold ms-1"
                   style="background:rgba(255,255,255,0.12);color:#fff;border:1px solid rgba(255,255,255,0.25);">
                   Salir
                </a>
            `;
        } else {
            authArea.innerHTML = `
                <a class="btn btn-warning btn-sm px-4 fw-semibold rounded-pill"
                   href="/usuario/usuario-login.html">Ingresar</a>
            `;
        }
    } catch (e) {
        // silently fail — session check is best-effort
    }
}
