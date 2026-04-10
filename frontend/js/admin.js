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

    // Stats
    const statsRes = await fetch('/api/admin/stats', { credentials: 'include' });
    const statsData = await statsRes.json();
    if (statsData.ok) {
      const s = statsData.stats;
      document.getElementById('stat-usuarios').textContent     = s.totalUsuarios;
      document.getElementById('stat-empresas').textContent     = s.totalEmpresas;
      document.getElementById('stat-vacantes').textContent     = s.totalVacantes;
      document.getElementById('stat-postulaciones').textContent = s.totalPostulaciones;
    }

    // Users table
    const usersRes = await fetch('/api/admin/usuarios', { credentials: 'include' });
    const usersData = await usersRes.json();
    const tbody = document.getElementById('tabla-usuarios');
    if (usersData.ok && tbody) {
      if (usersData.usuarios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No hay usuarios.</td></tr>';
      } else {
        const rolColors = { admin: '#2e3266', empresa: '#059669', candidato: '#ea580c' };
        tbody.innerHTML = usersData.usuarios.map(u => {
          const activo = u.activo;
          const initials = (u.nombre[0] + (u.apellido[0] || '')).toUpperCase();
          const rolColor = rolColors[u.rol] || '#6b7280';
          const estadoBadge = activo
            ? '<span class="badge rounded-pill" style="background:#ecfdf5;color:#059669;font-size:0.72rem;">● Activo</span>'
            : '<span class="badge rounded-pill" style="background:#f3f4f6;color:#6b7280;font-size:0.72rem;">● Inactivo</span>';
          const btnClass = activo ? 'btn-outline-danger' : 'btn-outline-success';
          const btnLabel = activo ? 'Desactivar' : 'Activar';
          return `
            <tr>
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
    }
  } catch (err) {
    console.error('Error cargando admin:', err);
  }
}

async function toggleUsuario(id) {
  try {
    const res = await fetch(`/api/admin/usuarios/${id}/toggle`, {
      method: 'PUT',
      credentials: 'include'
    });
    const data = await res.json();
    if (data.ok) {
      // Reload to refresh state
      loadAdmin();
    }
  } catch (err) {
    console.error('Error al cambiar estado:', err);
  }
}

// Expose toggle globally for onclick handlers
window.toggleUsuario = toggleUsuario;

loadAdmin();
