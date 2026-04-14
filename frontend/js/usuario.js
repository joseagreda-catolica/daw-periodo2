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

    // Contacto
    const telWrap  = document.getElementById('perfil-telefono-wrap');
    const telSpan  = document.getElementById('perfil-telefono');
    const ubicWrap = document.getElementById('perfil-ubicacion-wrap');
    const ubicSpan = document.getElementById('perfil-ubicacion');
    const vacioMsg = document.getElementById('perfil-contacto-vacio');
    let tieneContacto = false;
    if (candidato.telefono && telWrap && telSpan) {
      telSpan.textContent = candidato.telefono;
      telWrap.style.display = '';
      tieneContacto = true;
    }
    if (candidato.ubicacion && ubicWrap && ubicSpan) {
      ubicSpan.textContent = candidato.ubicacion;
      ubicWrap.style.display = '';
      tieneContacto = true;
    }
    if (vacioMsg) vacioMsg.style.display = tieneContacto ? 'none' : '';

    // CV
    const cvInfoWrap  = document.getElementById('cv-info-wrap');
    const cvEmptyWrap = document.getElementById('cv-empty-wrap');
    const cvFilename  = document.getElementById('cv-filename');
    const cvLink      = document.getElementById('cv-link');
    if (candidato.cv_url) {
      const nombreArchivo = candidato.cv_url.split('/').pop();
      if (cvFilename) cvFilename.textContent = nombreArchivo;
      if (cvLink) cvLink.href = candidato.cv_url;
      if (cvInfoWrap)  cvInfoWrap.style.display  = '';
      if (cvEmptyWrap) cvEmptyWrap.style.display = 'none';
    } else {
      if (cvInfoWrap)  cvInfoWrap.style.display  = 'none';
      if (cvEmptyWrap) cvEmptyWrap.style.display = '';
    }

    // Pre-llenar modal de edición con valores actuales
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val || '';
    };
    setVal('edit-titulo',          candidato.titulo_profesional);
    setVal('edit-ubicacion',       candidato.ubicacion);
    setVal('edit-telefono',        candidato.telefono);
    setVal('edit-resumen',         candidato.resumen);
    setVal('edit-fecha-nacimiento', candidato.fecha_nacimiento
      ? new Date(candidato.fecha_nacimiento).toISOString().split('T')[0]
      : '');

    // Postulaciones
    const lista = document.getElementById('perfil-postulaciones');
    if (lista) {
      if (!postulaciones || postulaciones.length === 0) {
        lista.innerHTML = '<p class="text-secondary small text-center py-3">No tienes postulaciones aún.</p>';
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
                <p class="text-muted mb-0" style="font-size:0.72rem;">${new Date(p.fecha_postulacion).toLocaleDateString('es-SV')}</p>
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

// ── Guardar perfil ────────────────────────────────────────────────────────────
document.getElementById('btn-guardar-perfil')?.addEventListener('click', async () => {
  const btn      = document.getElementById('btn-guardar-perfil');
  const feedback = document.getElementById('perfil-edit-feedback');
  feedback.innerHTML = '';
  btn.disabled = true;
  btn.textContent = 'Guardando...';

  const body = {
    titulo_profesional: document.getElementById('edit-titulo')?.value?.trim()          || null,
    ubicacion:          document.getElementById('edit-ubicacion')?.value?.trim()       || null,
    telefono:           document.getElementById('edit-telefono')?.value?.trim()        || null,
    resumen:            document.getElementById('edit-resumen')?.value?.trim()         || null,
    fecha_nacimiento:   document.getElementById('edit-fecha-nacimiento')?.value        || null
  };

  try {
    const res  = await fetch('/api/candidato/perfil', {
      method:  'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body)
    });
    const data = await res.json();

    if (data.ok) {
      bootstrap.Modal.getInstance(document.getElementById('modalEditarPerfil'))?.hide();
      loadPerfil();
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

// ── Subir CV ──────────────────────────────────────────────────────────────────
document.getElementById('btn-subir-cv')?.addEventListener('click', async () => {
  const fileInput = document.getElementById('cv-file');
  const feedback  = document.getElementById('cv-upload-feedback');
  const btn       = document.getElementById('btn-subir-cv');
  feedback.innerHTML = '';

  if (!fileInput?.files?.length) {
    feedback.innerHTML = '<div class="alert alert-warning py-2 small mb-0">Selecciona un archivo primero.</div>';
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Subiendo...';

  const formData = new FormData();
  formData.append('cv', fileInput.files[0]);

  try {
    const res  = await fetch('/api/candidato/cv', {
      method: 'POST',
      credentials: 'include',
      body: formData
      // Sin Content-Type header — el navegador lo pone con el boundary correcto
    });
    const data = await res.json();

    if (data.ok) {
      bootstrap.Modal.getInstance(document.getElementById('modalSubirCV'))?.hide();
      loadPerfil();
    } else {
      feedback.innerHTML = `<div class="alert alert-danger py-2 small mb-0">${data.message}</div>`;
    }
  } catch (err) {
    feedback.innerHTML = '<div class="alert alert-danger py-2 small mb-0">Error al subir el archivo.</div>';
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="bi bi-upload me-1"></i>Subir CV';
  }
});

loadPerfil();
