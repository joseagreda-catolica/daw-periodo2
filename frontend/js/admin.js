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
        tbody.innerHTML = usersData.usuarios.map(u => {
          const activo = u.activo;
          const badge = activo
            ? '<span class="badge bg-success">Activo</span>'
            : '<span class="badge bg-secondary">Inactivo</span>';
          const btnClass = activo ? 'btn-outline-danger' : 'btn-outline-success';
          const btnLabel = activo ? 'Desactivar' : 'Activar';
          return `
            <tr>
              <td>${u.nombre} ${u.apellido}</td>
              <td>${u.email}</td>
              <td><span class="badge bg-light text-dark border">${u.rol}</span></td>
              <td>${badge}</td>
              <td>
                <button class="btn btn-sm ${btnClass}" onclick="toggleUsuario(${u.id_usuario}, this)">
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

async function toggleUsuario(id, btn) {
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
