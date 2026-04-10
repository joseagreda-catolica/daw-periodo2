const estadoConfig = {
  enviada:     { label: 'Enviada',     dot: '#6b7280', bg: '#f3f4f6', color: '#374151' },
  en_revision: { label: 'En revisión', dot: '#d97706', bg: '#fffbeb', color: '#92400e' },
  entrevista:  { label: 'Entrevista',  dot: '#0891b2', bg: '#ecfeff', color: '#164e63' },
  contratado:  { label: 'Contratado',  dot: '#059669', bg: '#ecfdf5', color: '#065f46' },
  rechazada:   { label: 'Rechazada',   dot: '#dc2626', bg: '#fef2f2', color: '#991b1b' }
};

function estadoBadge(estado) {
  const cfg = estadoConfig[estado] || { label: estado, dot: '#6b7280', bg: '#f3f4f6', color: '#374151' };
  return `<span style="background:${cfg.bg};color:${cfg.color};font-size:0.72rem;font-weight:600;padding:4px 10px;border-radius:20px;white-space:nowrap;">
    <span class="estado-dot" style="background:${cfg.dot};"></span>${cfg.label}
  </span>`;
}

async function loadPerfil() {
  try {
    const res = await fetch('/api/candidato/perfil', { credentials: 'include' });

    if (res.status === 401 || res.status === 403) {
      window.location.href = '/usuario/usuario-login.html';
      return;
    }

    const data = await res.json();
    if (!data.ok) throw new Error(data.message);

    const { candidato, postulaciones } = data;

    // Header
    const nombre = document.getElementById('perfil-nombre');
    const tituloUbic = document.getElementById('perfil-titulo-ubicacion');
    const email = document.getElementById('perfil-email');
    if (nombre) nombre.textContent = `${candidato.nombre} ${candidato.apellido}`;
    if (tituloUbic) {
      const titulo = candidato.titulo_profesional || 'Sin título';
      const ubic = candidato.ubicacion || '';
      tituloUbic.innerHTML = ubic ? `${titulo} &nbsp;·&nbsp; ${ubic}` : titulo;
    }
    if (email) email.textContent = candidato.email;

    // Resumen
    const resumen = document.getElementById('perfil-resumen');
    if (resumen) resumen.textContent = candidato.resumen || 'Sin resumen.';

    // Postulaciones
    const lista = document.getElementById('perfil-postulaciones');
    if (lista) {
      if (!postulaciones || postulaciones.length === 0) {
        lista.innerHTML = '<p class="text-secondary small">No tienes postulaciones aún.</p>';
      } else {
        lista.innerHTML = postulaciones.map(p => `
          <div class="postulacion-item d-flex justify-content-between align-items-center gap-3">
            <div class="d-flex align-items-center gap-3">
              <div class="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                   style="width:40px;height:40px;background:#eef2ff;">
                <i class="bi bi-briefcase-fill" style="color:#2e3266;"></i>
              </div>
              <div>
                <p class="fw-semibold mb-0" style="font-size:0.875rem;color:#1a1d2e;">${p.titulo}</p>
                <p class="text-muted mb-0" style="font-size:0.78rem;">${p.nombre_empresa}${p.ubicacion ? ' · ' + p.ubicacion : ''}</p>
              </div>
            </div>
            ${estadoBadge(p.estado)}
          </div>
        `).join('');
      }
    }
  } catch (err) {
    console.error('Error cargando perfil:', err);
  }
}

loadPerfil();
