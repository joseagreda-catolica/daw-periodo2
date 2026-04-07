const estadoBadge = {
  enviada:     '<span class="badge bg-secondary">Enviada</span>',
  en_revision: '<span class="badge bg-warning text-dark">En revisión</span>',
  entrevista:  '<span class="badge bg-info text-dark">Entrevista</span>',
  contratado:  '<span class="badge bg-success">Contratado</span>',
  rechazada:   '<span class="badge bg-danger">Rechazada</span>'
};

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
          <div class="bg-white rounded-3 p-3 d-flex justify-content-between align-items-center">
            <div>
              <p class="fw-semibold mb-0">${p.titulo}</p>
              <p class="text-secondary small mb-0">${p.nombre_empresa} &nbsp;·&nbsp; ${p.ubicacion || ''}</p>
            </div>
            ${estadoBadge[p.estado] || `<span class="badge bg-secondary">${p.estado}</span>`}
          </div>
        `).join('');
      }
    }
  } catch (err) {
    console.error('Error cargando perfil:', err);
  }
}

loadPerfil();
