async function loadAdmin() {
  try {
    // Check session
    const sessionRes = await fetch('/api/auth/check-session', { credentials: 'include' });
    const session = await sessionRes.json();
    if (!session.logged || session.user.rol !== 'admin') {
      window.location.href = '/usuario/usuario-login.html';
      return;
    }

    const nombreEl = document.getElementById('admin-nombre');
    if (nombreEl) nombreEl.textContent = session.user.nombre;

    // Cargar todas las secciones en paralelo
    await Promise.all([
      loadStats(),
      loadUsuarios(),
      loadEmpresas(),
      loadVacantesAdmin(),
      loadModeracion(),
      loadRecursosAdmin()
    ]);
  } catch (err) {
    console.error('Error cargando admin:', err);
  }
}


//----------------SIDEBAR---------------------------------------------
function activarSidebar() {
  const currentPath = window.location.pathname;

  const links = document.querySelectorAll('.sidebar .nav-link');

  if (!links.length) return; 
  links.forEach(link => {
    const href = link.getAttribute('href');

    if (!href) return; 

    if (currentPath.endsWith(href) || currentPath.includes(href)) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// ── Stats ─────────────────────────────────────────────────────────────────────
async function loadStats() {
  const statsRes = await fetch('/api/admin/stats', { credentials: 'include' });
  const statsData = await statsRes.json();
  if (statsData.ok) {
    const s = statsData.stats;
    document.getElementById('stat-usuarios').textContent      = s.totalUsuarios;
    document.getElementById('stat-empresas').textContent      = s.totalEmpresas;
    document.getElementById('stat-vacantes').textContent      = s.totalVacantes;
    document.getElementById('stat-postulaciones').textContent = s.totalPostulaciones;
  }
}

// ── Usuarios ─────────────────────────────────────────────────────────────────
async function loadUsuarios() {
  const usersRes = await fetch('/api/admin/usuarios', { credentials: 'include' });
  const usersData = await usersRes.json();
  const tbody = document.getElementById('tabla-usuarios');
  if (!usersData.ok || !tbody) return;

  if (usersData.usuarios.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No hay usuarios.</td></tr>';
    return;
  }

  const rolColors = { admin: '#2e3266', empresa: '#059669', candidato: '#ea580c' };
  tbody.innerHTML = usersData.usuarios.map(u => {
    const activo     = u.activo;
    const initials   = ((u.nombre || '?')[0] + ((u.apellido || '?')[0] || '')).toUpperCase();
    const rolColor   = rolColors[u.rol] || '#6b7280';
    const estadoBadge = activo
      ? '<span class="badge rounded-pill" style="background:#ecfdf5;color:#059669;font-size:0.72rem;">● Activo</span>'
      : '<span class="badge rounded-pill" style="background:#f3f4f6;color:#6b7280;font-size:0.72rem;">● Inactivo</span>';
    const btnClass = activo ? 'btn-outline-danger' : 'btn-outline-success';
    const btnLabel = activo ? 'Desactivar' : 'Activar';
    return `
      <tr data-rol="${u.rol}" data-activo="${u.activo}">
        <td>
          <div class="d-flex align-items-center gap-3">
            <div class="user-avatar">${initials}</div>
            <div>
              <div class="fw-semibold" style="font-size:0.875rem;color:#1a1d2e;">${u.nombre} ${u.apellido}</div>
              <div class="text-muted" style="font-size:0.78rem;">${u.email}</div>
            </div>
          </div>
        </td>
        <td><span class="badge-rol" style="background:${rolColor}20;color:${rolColor};">${u.rol}</span></td>
        <td>${estadoBadge}</td>
        <td class="text-end">
          <button class="btn btn-sm ${btnClass} rounded-pill px-3" style="font-size:0.78rem;" onclick="toggleUsuario(${u.id_usuario})">
            ${btnLabel}
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// ── Empresas ──────────────────────────────────────────────────────────────────
async function loadEmpresas() {
  const res  = await fetch('/api/admin/empresas', { credentials: 'include' });
  const data = await res.json();
  const tbody = document.getElementById('tabla-empresas');
  if (!data.ok || !tbody) return;

  if (!data.empresas || data.empresas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-3">No hay empresas.</td></tr>';
    return;
  }

  tbody.innerHTML = data.empresas.map(e => {
    const estadoBadge = e.activo
      ? '<span class="badge rounded-pill" style="background:#ecfdf5;color:#059669;font-size:0.72rem;">● Activa</span>'
      : '<span class="badge rounded-pill" style="background:#f3f4f6;color:#6b7280;font-size:0.72rem;">● Suspendida</span>';
    const btnClass = e.activo ? 'btn-outline-danger' : 'btn-outline-success';
    const btnLabel = e.activo ? 'Suspender' : 'Activar';
    return `
      <tr data-activo="${e.activo}">
        <td class="fw-semibold">${e.nombre_empresa}</td>
        <td class="text-muted small">${e.sector || '—'}</td>
        <td class="text-muted small">${e.ubicacion || '—'}</td>
        <td>${estadoBadge}</td>
        <td class="text-end">
          <button class="btn btn-sm ${btnClass} rounded-pill px-3" style="font-size:0.78rem;" onclick="toggleUsuario(${e.id_usuario})">
            ${btnLabel}
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// ── Vacantes ──────────────────────────────────────────────────────────────────
async function loadVacantesAdmin() {
  const res  = await fetch('/api/admin/vacantes', { credentials: 'include' });
  const data = await res.json();
  const tbody = document.getElementById('tabla-vacantes-admin');
  if (!data.ok || !tbody) return;

  if (!data.vacantes || data.vacantes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-3">No hay vacantes.</td></tr>';
    return;
  }

  tbody.innerHTML = data.vacantes.map(v => {
    const fecha = v.fecha_publicacion
      ? new Date(v.fecha_publicacion).toLocaleDateString('es-SV')
      : '—';
    const estadoBadge = v.estado === 'activa'
      ? '<span class="badge bg-success">Activa</span>'
      : '<span class="badge bg-secondary">Cerrada</span>';
    return `
      <tr>
        <td class="fw-semibold small">${v.titulo}</td>
        <td class="text-muted small">${v.nombre_empresa || '—'}</td>
        <td>${estadoBadge}</td>
        <td class="text-muted small">${fecha}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-danger rounded-pill px-2"
                  style="font-size:0.75rem;"
                  onclick="eliminarVacante(${v.id_vacante})">
            <i class="bi bi-trash me-1"></i>Eliminar
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// ── Moderación ────────────────────────────────────────────────────────────────
async function loadModeracion() {
  const res  = await fetch('/api/admin/moderacion', { credentials: 'include' });
  const data = await res.json();
  const tbody = document.getElementById('tabla-moderacion');
  if (!data.ok || !tbody) return;

  if (!data.pendientes || data.pendientes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-3">No hay valoraciones pendientes. ✓</td></tr>';
    return;
  }

  const estrellas = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

  tbody.innerHTML = data.pendientes.map(v => `
    <tr>
      <td class="fw-semibold small">${v.nombre_empresa}</td>
      <td class="small">${v.nombre} ${v.apellido}</td>
      <td><span class="text-warning fw-bold">${estrellas(v.puntuacion)}</span> <small class="text-muted">(${v.puntuacion}/5)</small></td>
      <td class="small text-muted">${v.comentario || '—'}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-success rounded-pill me-1"
                onclick="aprobarValoracion(${v.id_valoracion})">
          <i class="bi bi-check2 me-1"></i>Aprobar
        </button>
        <button class="btn btn-sm btn-outline-danger rounded-pill"
                onclick="rechazarValoracion(${v.id_valoracion})">
          <i class="bi bi-x me-1"></i>Rechazar
        </button>
      </td>
    </tr>
  `).join('');
}

// ── Recursos ──────────────────────────────────────────────────────────────────
async function loadRecursosAdmin() {
  const res  = await fetch('/api/admin/recursos', { credentials: 'include' });
  const data = await res.json();
  const tbody = document.getElementById('tabla-recursos-admin');
  if (!data.ok || !tbody) return;

  if (!data.recursos || data.recursos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-3">No hay recursos.</td></tr>';
    return;
  }

  const tipoIcon = { articulo: 'bi-file-text', video: 'bi-play-circle', guia: 'bi-book' };
  const tipoColor = { articulo: '#0891b2', video: '#dc2626', guia: '#059669' };

  tbody.innerHTML = data.recursos.map(r => {
    const icon  = tipoIcon[r.tipo]  || 'bi-file';
    const color = tipoColor[r.tipo] || '#6b7280';
    const fecha = r.fecha_publicacion
      ? new Date(r.fecha_publicacion).toLocaleDateString('es-SV')
      : '—';
    return `
      <tr>
        <td>
          <div class="d-flex align-items-center gap-2">
            <i class="bi ${icon}" style="color:${color};"></i>
            <span class="fw-semibold small">${r.titulo}</span>
          </div>
          ${r.url_contenido ? `<a href="${r.url_contenido}" target="_blank" class="text-muted" style="font-size:0.72rem;">${r.url_contenido.substring(0,50)}...</a>` : ''}
        </td>
        <td><span class="badge" style="background:${color}20;color:${color};">${r.tipo}</span></td>
        <td class="text-muted small">${fecha}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-danger rounded-pill"
                  style="font-size:0.75rem;"
                  onclick="eliminarRecurso(${r.id_recurso})">
            <i class="bi bi-trash me-1"></i>Eliminar
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// ── Acciones ──────────────────────────────────────────────────────────────────
async function toggleUsuario(id) {
  try {
    const res = await fetch(`/api/admin/usuarios/${id}/toggle`, {
      method: 'PUT',
      credentials: 'include'
    });
    const data = await res.json();
    if (data.ok) loadUsuarios();
  } catch (err) {
    console.error('Error al cambiar estado:', err);
  }
}

async function eliminarVacante(id) {
  if (!confirm('¿Eliminar esta vacante? Esta acción no se puede deshacer.')) return;
  try {
    const res  = await fetch(`/api/admin/vacantes/${id}`, { method: 'DELETE', credentials: 'include' });
    const data = await res.json();
    if (data.ok) { loadVacantesAdmin(); loadStats(); }
  } catch (err) {
    console.error('Error al eliminar vacante:', err);
  }
}

async function aprobarValoracion(id) {
  try {
    const res  = await fetch(`/api/admin/valoraciones/${id}/aprobar`, { method: 'PUT', credentials: 'include' });
    const data = await res.json();
    if (data.ok) loadModeracion();
  } catch (err) {
    console.error('Error al aprobar:', err);
  }
}

async function rechazarValoracion(id) {
  if (!confirm('¿Rechazar y eliminar esta valoración?')) return;
  try {
    const res  = await fetch(`/api/admin/valoraciones/${id}`, { method: 'DELETE', credentials: 'include' });
    const data = await res.json();
    if (data.ok) loadModeracion();
  } catch (err) {
    console.error('Error al rechazar:', err);
  }
}

async function crearRecurso() {
  const titulo      = document.getElementById('recurso-titulo')?.value?.trim();
  const tipo        = document.getElementById('recurso-tipo')?.value;
  const url         = document.getElementById('recurso-url')?.value?.trim()         || null;
  const descripcion = document.getElementById('recurso-descripcion')?.value?.trim() || null;
  const feedback    = document.getElementById('recurso-feedback');

  if (!titulo) {
    if (feedback) feedback.innerHTML = '<div class="alert alert-warning py-1 small">El título es requerido.</div>';
    return;
  }

  try {
    const res  = await fetch('/api/admin/recursos', {
      method:  'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ titulo, tipo, url_contenido: url, descripcion })
    });
    const data = await res.json();

    if (data.ok) {
      if (feedback) feedback.innerHTML = '<div class="alert alert-success py-1 small">Recurso creado.</div>';
      document.getElementById('recurso-titulo').value      = '';
      document.getElementById('recurso-url').value         = '';
      document.getElementById('recurso-descripcion').value = '';
      loadRecursosAdmin();
      setTimeout(() => { if (feedback) feedback.innerHTML = ''; }, 3000);
    } else {
      if (feedback) feedback.innerHTML = `<div class="alert alert-danger py-1 small">${data.message}</div>`;
    }
  } catch (err) {
    console.error('Error al crear recurso:', err);
  }
}

async function eliminarRecurso(id) {
  if (!confirm('¿Eliminar este recurso?')) return;
  try {
    const res  = await fetch(`/api/admin/recursos/${id}`, { method: 'DELETE', credentials: 'include' });
    const data = await res.json();
    if (data.ok) loadRecursosAdmin();
  } catch (err) {
    console.error('Error al eliminar recurso:', err);
  }
}

// Exponer funciones globalmente para onclick handlers
window.toggleUsuario      = toggleUsuario;
window.eliminarVacante    = eliminarVacante;
window.aprobarValoracion  = aprobarValoracion;
window.rechazarValoracion = rechazarValoracion;
window.crearRecurso       = crearRecurso;
window.eliminarRecurso    = eliminarRecurso;

loadAdmin();
