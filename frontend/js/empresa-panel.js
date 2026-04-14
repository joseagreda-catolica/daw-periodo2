// ── Datos de empresa guardados en memoria ─────────────────────────────────────
let _empresaData = null;

// ── Carga inicial del panel ───────────────────────────────────────────────────
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
    _empresaData = empresa;

    // Top bar y sidebar
    const nombreNav = document.getElementById('empresa-nombre-nav');
    if (nombreNav) nombreNav.textContent = empresa.nombre_empresa;

    // Stats
    const el = (id) => document.getElementById(id);
    if (el('stat-candidatos')) el('stat-candidatos').textContent = stats.candidatos_activos;
    if (el('stat-vacantes'))   el('stat-vacantes').textContent   = stats.vacantes_abiertas;
    if (el('stat-reputacion')) el('stat-reputacion').textContent = stats.reputacion + ' ★';

    // Perfil info
    const perfilInfo = el('empresa-perfil-info');
    if (perfilInfo) {
      perfilInfo.innerHTML = `
        <div class="col-md-6 small"><strong>Sector:</strong> ${empresa.sector || '—'}</div>
        <div class="col-md-6 small"><strong>Ubicación:</strong> ${empresa.ubicacion || '—'}</div>
        <div class="col-md-6 small"><strong>Teléfono:</strong> ${empresa.telefono || '—'}</div>
        <div class="col-md-6 small"><strong>Sitio web:</strong> ${empresa.sitio_web
          ? `<a href="${empresa.sitio_web}" target="_blank">${empresa.sitio_web}</a>` : '—'}</div>
        <div class="col-12 small"><strong>Descripción:</strong> ${empresa.descripcion || '—'}</div>
      `;
    }

    // Pre-llenar modal editar empresa
    const setVal = (id, val) => { const e = el(id); if (e) e.value = val || ''; };
    setVal('emp-nombre',      empresa.nombre_empresa);
    setVal('emp-sector',      empresa.sector);
    setVal('emp-ubicacion',   empresa.ubicacion);
    setVal('emp-telefono',    empresa.telefono);
    setVal('emp-sitio-web',   empresa.sitio_web);
    setVal('emp-descripcion', empresa.descripcion);

    // Tabla de vacantes
    renderTablaVacantes(vacantes);

  } catch (err) {
    console.error('Error cargando panel empresa:', err);
  }
}

function renderTablaVacantes(vacantes) {
  const tbody = document.getElementById('tabla-vacantes');
  if (!tbody) return;

  if (!vacantes || vacantes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-3">No tienes vacantes publicadas.</td></tr>';
    return;
  }

  tbody.innerHTML = vacantes.map(v => {
    const fecha = v.fecha_publicacion
      ? new Date(v.fecha_publicacion).toLocaleDateString('es-SV')
      : '—';
    const estadoBadge = v.estado === 'activa'
      ? '<span class="badge bg-success">Activa</span>'
      : '<span class="badge bg-secondary">Cerrada</span>';
    return `
      <tr>
        <td class="fw-semibold">${v.titulo}</td>
        <td class="text-muted small">${fecha}</td>
        <td>${estadoBadge}</td>
        <td class="fw-bold">${v.total_postulaciones || 0}</td>
        <td>
          <button class="btn btn-sm btn-light border me-1" onclick="abrirEditarVacante(${v.id_vacante})">
            <i class="bi bi-pencil me-1"></i>Editar
          </button>
          <button class="btn btn-sm btn-outline-primary" onclick="verPostulaciones(${v.id_vacante}, '${v.titulo.replace(/'/g, "\\'")}')">
            <i class="bi bi-people me-1"></i>Candidatos
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// ── Abrir modal para crear vacante ────────────────────────────────────────────
function abrirNuevaVacante() {
  document.getElementById('modal-vacante-titulo').textContent = 'Publicar Vacante';
  document.getElementById('btn-guardar-vacante').innerHTML = '<i class="bi bi-check-circle me-1"></i>Publicar Vacante';
  document.getElementById('vacante-id-edit').value = '';
  document.getElementById('vacante-feedback').innerHTML = '';
  ['vac-titulo','vac-ubicacion','vac-descripcion','vac-salario-min','vac-salario-max','vac-fecha-cierre'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('vac-tipo').value  = 'tiempo_completo';
  document.getElementById('vac-nivel').value = 'junior';
  document.getElementById('vac-estado').value = 'activa';
  bootstrap.Modal.getOrCreateInstance(document.getElementById('modalVacante')).show();
}

// ── Abrir modal para editar vacante ───────────────────────────────────────────
async function abrirEditarVacante(id) {
  try {
    const res  = await fetch(`/api/vacantes/${id}`, { credentials: 'include' });
    const data = await res.json();
    if (!data.ok) throw new Error(data.message);

    const v = data.vacante;
    document.getElementById('modal-vacante-titulo').textContent = 'Editar Vacante';
    document.getElementById('btn-guardar-vacante').innerHTML = '<i class="bi bi-check-circle me-1"></i>Guardar cambios';
    document.getElementById('vacante-id-edit').value = v.id_vacante;
    document.getElementById('vacante-feedback').innerHTML = '';

    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
    setVal('vac-titulo',      v.titulo);
    setVal('vac-ubicacion',   v.ubicacion);
    setVal('vac-descripcion', v.descripcion);
    setVal('vac-salario-min', v.salario_min);
    setVal('vac-salario-max', v.salario_max);
    setVal('vac-tipo',        v.tipo_contrato);
    setVal('vac-nivel',       v.nivel_experiencia);
    setVal('vac-estado',      v.estado);
    setVal('vac-fecha-cierre', v.fecha_cierre
      ? new Date(v.fecha_cierre).toISOString().split('T')[0]
      : '');

    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalVacante')).show();
  } catch (err) {
    console.error('Error cargando vacante para editar:', err);
  }
}

// ── Ver postulaciones de una vacante ──────────────────────────────────────────
async function verPostulaciones(idVacante, titulo) {
  const lista = document.getElementById('lista-postulaciones');
  const modalTitulo = document.getElementById('modal-postulaciones-titulo');
  if (modalTitulo) modalTitulo.textContent = titulo;
  if (lista) lista.innerHTML = '<p class="text-muted text-center py-3">Cargando...</p>';

  bootstrap.Modal.getOrCreateInstance(document.getElementById('modalPostulaciones')).show();

  try {
    const res  = await fetch(`/api/empresa/vacantes/${idVacante}/postulaciones`, { credentials: 'include' });
    const data = await res.json();
    if (!data.ok) throw new Error(data.message);

    const { postulaciones } = data;

    if (!postulaciones || postulaciones.length === 0) {
      lista.innerHTML = '<p class="text-muted text-center py-3">No hay postulaciones aún para esta vacante.</p>';
      return;
    }

    const estadoOpciones = `
      <option value="enviada">Enviada</option>
      <option value="en_revision">En revisión</option>
      <option value="entrevista">Entrevista</option>
      <option value="contratado">Contratado</option>
      <option value="rechazada">Rechazada</option>
    `;

    lista.innerHTML = `
      <div class="table-responsive">
        <table class="table align-middle">
          <thead class="table-light">
            <tr>
              <th>Candidato</th>
              <th>Título profesional</th>
              <th>Carta de presentación</th>
              <th>Fecha</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${postulaciones.map(p => `
              <tr>
                <td>
                  <div class="fw-semibold small">${p.nombre} ${p.apellido}</div>
                  <div class="text-muted" style="font-size:0.75rem;">${p.email}</div>
                  ${p.cv_url ? `<a href="${p.cv_url}" target="_blank" class="small text-primary"><i class="bi bi-file-earmark-pdf me-1"></i>Ver CV</a>` : ''}
                </td>
                <td class="small text-muted">${p.titulo_profesional || '—'}</td>
                <td class="small" style="max-width:200px;">
                  ${p.carta_presentacion
                    ? `<span title="${p.carta_presentacion}">${p.carta_presentacion.substring(0,80)}${p.carta_presentacion.length > 80 ? '...' : ''}</span>`
                    : '<span class="text-muted">Sin carta</span>'}
                </td>
                <td class="small text-muted">${new Date(p.fecha_postulacion).toLocaleDateString('es-SV')}</td>
                <td>
                  <select class="form-select form-select-sm" style="min-width:130px;"
                    onchange="actualizarEstado(${p.id_postulacion}, this.value)">
                    ${estadoOpciones}
                  </select>
                  <script>
                    (function() {
                      var selects = document.querySelectorAll('#lista-postulaciones select');
                      var s = selects[selects.length - 1];
                      if (s) s.value = '${p.estado}';
                    })();
                  <\/script>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) {
    if (lista) lista.innerHTML = '<p class="text-danger text-center py-3">Error al cargar postulaciones.</p>';
    console.error(err);
  }
}

// ── Actualizar estado de postulación ──────────────────────────────────────────
async function actualizarEstado(idPostulacion, estado) {
  try {
    const res  = await fetch(`/api/empresa/postulaciones/${idPostulacion}`, {
      method:  'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ estado })
    });
    const data = await res.json();
    if (!data.ok) console.error('Error actualizando estado:', data.message);
  } catch (err) {
    console.error('Error al actualizar estado:', err);
  }
}

// ── Guardar vacante (crear o editar) ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Botones "Nueva Vacante"
  document.getElementById('btn-nueva-vacante')?.addEventListener('click', abrirNuevaVacante);
  document.getElementById('btn-nueva-vacante-2')?.addEventListener('click', abrirNuevaVacante);

  // Guardar vacante
  document.getElementById('btn-guardar-vacante')?.addEventListener('click', async () => {
    const idEdit   = document.getElementById('vacante-id-edit').value;
    const feedback = document.getElementById('vacante-feedback');
    const btn      = document.getElementById('btn-guardar-vacante');
    feedback.innerHTML = '';

    const body = {
      titulo:            document.getElementById('vac-titulo')?.value?.trim(),
      descripcion:       document.getElementById('vac-descripcion')?.value?.trim(),
      ubicacion:         document.getElementById('vac-ubicacion')?.value?.trim(),
      tipo_contrato:     document.getElementById('vac-tipo')?.value,
      nivel_experiencia: document.getElementById('vac-nivel')?.value,
      estado:            document.getElementById('vac-estado')?.value,
      salario_min:       document.getElementById('vac-salario-min')?.value || null,
      salario_max:       document.getElementById('vac-salario-max')?.value || null,
      fecha_cierre:      document.getElementById('vac-fecha-cierre')?.value || null
    };

    if (!body.titulo) {
      feedback.innerHTML = '<div class="alert alert-warning py-2 small mb-0">El título es requerido.</div>';
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Guardando...';

    try {
      const url    = idEdit ? `/api/empresa/vacantes/${idEdit}` : '/api/empresa/vacantes';
      const method = idEdit ? 'PUT' : 'POST';
      const res    = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (data.ok) {
        bootstrap.Modal.getInstance(document.getElementById('modalVacante'))?.hide();
        loadPanel();
      } else {
        feedback.innerHTML = `<div class="alert alert-danger py-2 small mb-0">${data.message}</div>`;
      }
    } catch (err) {
      feedback.innerHTML = '<div class="alert alert-danger py-2 small mb-0">Error de conexión.</div>';
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-check-circle me-1"></i>Guardar cambios';
    }
  });

  // Guardar perfil empresa
  document.getElementById('btn-guardar-empresa')?.addEventListener('click', async () => {
    const feedback = document.getElementById('empresa-edit-feedback');
    const btn      = document.getElementById('btn-guardar-empresa');
    feedback.innerHTML = '';
    btn.disabled = true;
    btn.textContent = 'Guardando...';

    const body = {
      nombre_empresa: document.getElementById('emp-nombre')?.value?.trim(),
      sector:         document.getElementById('emp-sector')?.value?.trim()    || null,
      ubicacion:      document.getElementById('emp-ubicacion')?.value?.trim() || null,
      telefono:       document.getElementById('emp-telefono')?.value?.trim()  || null,
      sitio_web:      document.getElementById('emp-sitio-web')?.value?.trim() || null,
      descripcion:    document.getElementById('emp-descripcion')?.value?.trim() || null
    };

    try {
      const res  = await fetch('/api/empresa/perfil', {
        method:  'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body)
      });
      const data = await res.json();

      if (data.ok) {
        bootstrap.Modal.getInstance(document.getElementById('modalEditarEmpresa'))?.hide();
        loadPanel();
      } else {
        feedback.innerHTML = `<div class="alert alert-danger py-2 small mb-0">${data.message}</div>`;
      }
    } catch (err) {
      feedback.innerHTML = '<div class="alert alert-danger py-2 small mb-0">Error de conexión.</div>';
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-check-circle me-1"></i>Guardar cambios';
    }
  });
});

// Exponer funciones para onclick en HTML dinámico
window.abrirEditarVacante = abrirEditarVacante;
window.verPostulaciones   = verPostulaciones;
window.actualizarEstado   = actualizarEstado;

loadPanel();
