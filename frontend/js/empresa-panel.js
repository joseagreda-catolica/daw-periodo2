async function loadPanel() {
  try {
    const res = await fetch('/api/empresa/panel', { credentials: 'include' });

    if (res.status === 401 || res.status === 403) {
      window.location.href = '/usuario/usuario-login.html';
      return;
    }

    const data = await res.json();
    if (!data.ok) throw new Error(data.message);

    const { empresa, stats, vacantes } = data;

    // Navbar company name
    const nombreNav = document.getElementById('empresa-nombre-nav');
    if (nombreNav) nombreNav.textContent = empresa.nombre_empresa;

    // Stats
    const statCand = document.getElementById('stat-candidatos');
    const statVac  = document.getElementById('stat-vacantes');
    const statRep  = document.getElementById('stat-reputacion');
    if (statCand) statCand.textContent = stats.candidatos_activos;
    if (statVac)  statVac.textContent  = stats.vacantes_abiertas;
    if (statRep)  statRep.textContent  = stats.reputacion;

    // Vacantes table
    const tbody = document.getElementById('tabla-vacantes');
    if (tbody) {
      if (!vacantes || vacantes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No tienes vacantes publicadas.</td></tr>';
      } else {
        tbody.innerHTML = vacantes.map(v => {
          const fecha = v.fecha_publicacion
            ? new Date(v.fecha_publicacion).toLocaleDateString('es-SV')
            : '-';
          const estadoBadge = v.estado === 'activa'
            ? '<span class="badge bg-success">Activa</span>'
            : '<span class="badge bg-secondary">Cerrada</span>';
          return `
            <tr>
              <td class="fw-bold text-primary">${v.titulo}</td>
              <td>${fecha}</td>
              <td>${estadoBadge}</td>
              <td class="fw-bold">${v.total_postulaciones || 0}</td>
              <td><button class="btn btn-sm btn-light border">Editar</button></td>
            </tr>
          `;
        }).join('');
      }
    }
  } catch (err) {
    console.error('Error cargando panel empresa:', err);
  }
}

loadPanel();
