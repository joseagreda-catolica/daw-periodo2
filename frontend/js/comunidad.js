// ── Estado de sesión ──────────────────────────────────────────────────────────
let _session = null;
let _temaActualId = null;

// ── Inicialización ────────────────────────────────────────────────────────────
(async () => {
  const sessionRes = await fetch('/api/auth/check-session', { credentials: 'include' });
  _session = await sessionRes.json();

  if (!_session.logged) {
    window.location.href = '/usuario/usuario-login.html';
    return;
  }

  // Cargar foro y empresas en paralelo
  await Promise.all([
    loadTemas(),
    loadEmpresas()
  ]);

  setupEventListeners();
})();

// ── Foro: cargar temas ────────────────────────────────────────────────────────
async function loadTemas(categoria) {
  const lista = document.getElementById('lista-temas-foro');
  if (!lista) return;
  lista.innerHTML = '<p class="text-muted small text-center py-3">Cargando...</p>';

  try {
    const params = categoria ? '?categoria=' + categoria : '';
    const res  = await fetch('/api/foros/temas' + params, { credentials: 'include' });
    const data = await res.json();

    if (!data.ok || !data.temas || data.temas.length === 0) {
      lista.innerHTML = '<p class="text-muted small text-center py-3">No hay temas aún. ¡Crea el primero!</p>';
      return;
    }

    const catColors = {
      empleo:      '#2e3266',
      networking:  '#059669',
      recursos:    '#d97706',
      general:     '#6b7280'
    };

    lista.innerHTML = data.temas.map(t => {
      const fecha = new Date(t.fecha_creacion).toLocaleDateString('es-SV');
      const color = catColors[t.categoria] || '#6b7280';
      return `
        <div class="tema-card" onclick="verTema(${t.id_tema})">
          <div class="d-flex justify-content-between align-items-start">
            <div class="flex-grow-1 me-3">
              <h6 class="fw-bold mb-1" style="font-size:0.875rem;color:#1a1d2e;">${t.titulo}</h6>
              <div class="d-flex align-items-center gap-2 flex-wrap">
                <span class="badge rounded-pill" style="background:${color}20;color:${color};font-size:0.7rem;">${t.categoria || 'general'}</span>
                <small class="text-muted" style="font-size:0.72rem;">
                  <i class="bi bi-person me-1"></i>${t.nombre} ${t.apellido}
                  &nbsp;·&nbsp;
                  <i class="bi bi-calendar3 me-1"></i>${fecha}
                </small>
              </div>
            </div>
            <button class="btn btn-sm btn-light border flex-shrink-0" onclick="event.stopPropagation(); verTema(${t.id_tema})">
              <i class="bi bi-chat-left-text me-1"></i>${t.total_respuestas || 0}
            </button>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    lista.innerHTML = '<p class="text-danger small text-center py-3">Error al cargar temas.</p>';
    console.error(err);
  }
}

// ── Foro: ver tema con respuestas ─────────────────────────────────────────────
async function verTema(id) {
  _temaActualId = id;
  const listaResp    = document.getElementById('lista-respuestas');
  const modalTitulo  = document.getElementById('modal-tema-titulo');
  const modalAutor   = document.getElementById('modal-tema-autor');
  const formResponder = document.getElementById('form-responder');
  const loginMsg     = document.getElementById('responder-login-msg');

  if (listaResp) listaResp.innerHTML = '<p class="text-muted small text-center py-3">Cargando...</p>';
  bootstrap.Modal.getOrCreateInstance(document.getElementById('modalTema')).show();

  try {
    const res  = await fetch('/api/foros/temas/' + id, { credentials: 'include' });
    const data = await res.json();
    if (!data.ok) throw new Error(data.message);

    const { tema, respuestas } = data;
    if (modalTitulo) modalTitulo.textContent = tema.titulo;
    if (modalAutor)  modalAutor.textContent  = `${tema.nombre} ${tema.apellido} · ${new Date(tema.fecha_creacion).toLocaleDateString('es-SV')}`;

    // Mostrar/ocultar formulario de respuesta
    if (_session.logged) {
      if (formResponder) formResponder.style.display = '';
      if (loginMsg)      loginMsg.style.display = 'none';
      if (document.getElementById('respuesta-contenido')) {
        document.getElementById('respuesta-contenido').value = '';
      }
      if (document.getElementById('respuesta-feedback')) {
        document.getElementById('respuesta-feedback').innerHTML = '';
      }
    } else {
      if (formResponder) formResponder.style.display = 'none';
      if (loginMsg)      loginMsg.style.display = '';
    }

    if (!respuestas || respuestas.length === 0) {
      listaResp.innerHTML = '<p class="text-muted small text-center py-3">No hay respuestas aún.</p>';
      return;
    }

    listaResp.innerHTML = respuestas.map(r => `
      <div class="border rounded-3 p-3 mb-2" style="background:#fafbff;">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <span class="fw-semibold small">${r.nombre} ${r.apellido}</span>
          <small class="text-muted" style="font-size:0.72rem;">${new Date(r.fecha).toLocaleDateString('es-SV')}</small>
        </div>
        <p class="small text-secondary mb-0" style="white-space:pre-wrap;">${r.contenido}</p>
      </div>
    `).join('');

  } catch (err) {
    if (listaResp) listaResp.innerHTML = '<p class="text-danger small text-center py-3">Error al cargar el tema.</p>';
    console.error(err);
  }
}

// ── Valoraciones: cargar empresas ─────────────────────────────────────────────
async function loadEmpresas() {
  try {
    const res  = await fetch('/api/empresas', { credentials: 'include' });
    const data = await res.json();
    const sel  = document.getElementById('select-empresa-valorar');
    if (!sel || !data.ok) return;

    sel.innerHTML = '<option value="">-- Selecciona una empresa --</option>' +
      data.empresas.map(e => `<option value="${e.id_empresa}">${e.nombre_empresa}</option>`).join('');

  } catch (err) {
    console.error('Error cargando empresas:', err);
  }
}

// ── Valoraciones: cargar valoraciones de empresa seleccionada ─────────────────
async function loadValoraciones(idEmpresa) {
  const lista = document.getElementById('lista-valoraciones-empresa');
  if (!lista || !idEmpresa) { if (lista) lista.innerHTML = ''; return; }

  try {
    const res  = await fetch('/api/valoraciones/' + idEmpresa, { credentials: 'include' });
    const data = await res.json();
    if (!data.ok) return;

    const { valoraciones, promedio } = data;

    if (!valoraciones || valoraciones.length === 0) {
      lista.innerHTML = '<p class="text-muted small mb-0">Sin valoraciones aprobadas aún.</p>';
      return;
    }

    const prom = promedio.promedio ? parseFloat(promedio.promedio).toFixed(1) : '—';
    const estrellas = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

    lista.innerHTML = `
      <p class="small text-muted mb-2">
        Promedio: <strong class="text-warning">${prom}/5</strong>
        (${promedio.total} valoración${promedio.total !== 1 ? 'es' : ''})
      </p>
      ${valoraciones.slice(0, 3).map(v => `
        <div class="border rounded-3 p-2 mb-2 small" style="background:#fffbf0;">
          <div class="d-flex justify-content-between align-items-center">
            <span class="fw-semibold">${v.nombre} ${v.apellido}</span>
            <span class="text-warning">${estrellas(v.puntuacion)}</span>
          </div>
          ${v.comentario ? `<p class="text-muted mb-0 small" style="font-size:0.75rem;">${v.comentario}</p>` : ''}
        </div>
      `).join('')}
    `;
  } catch (err) {
    console.error('Error cargando valoraciones:', err);
  }
}

// ── Event Listeners ───────────────────────────────────────────────────────────
function setupEventListeners() {

  // Filtros de categoría del foro
  document.getElementById('filtros-categoria')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-cat]');
    if (!btn) return;
    document.querySelectorAll('#filtros-categoria button').forEach(b => b.classList.remove('active', 'btn-secondary'));
    btn.classList.add('active');
    loadTemas(btn.dataset.cat || undefined);
  });

  // Botón nuevo debate
  document.getElementById('btn-nuevo-debate')?.addEventListener('click', () => {
    if (!_session.logged) {
      window.location.href = '/usuario/usuario-login.html';
      return;
    }
    document.getElementById('debate-titulo').value    = '';
    document.getElementById('debate-feedback').innerHTML = '';
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalNuevoDebate')).show();
  });

  // Crear debate
  document.getElementById('btn-crear-debate')?.addEventListener('click', async () => {
    const titulo    = document.getElementById('debate-titulo')?.value?.trim();
    const categoria = document.getElementById('debate-categoria')?.value;
    const feedback  = document.getElementById('debate-feedback');
    const btn       = document.getElementById('btn-crear-debate');
    feedback.innerHTML = '';

    if (!titulo) {
      feedback.innerHTML = '<div class="alert alert-warning py-2 small mb-0">El título es requerido.</div>';
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Publicando...';

    try {
      const res  = await fetch('/api/foros/temas', {
        method:  'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ titulo, categoria })
      });
      const data = await res.json();

      if (data.ok) {
        bootstrap.Modal.getInstance(document.getElementById('modalNuevoDebate'))?.hide();
        loadTemas();
      } else {
        feedback.innerHTML = `<div class="alert alert-danger py-2 small mb-0">${data.message}</div>`;
      }
    } catch (err) {
      feedback.innerHTML = '<div class="alert alert-danger py-2 small mb-0">Error de conexión.</div>';
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-chat-dots me-1"></i>Publicar debate';
    }
  });

  // Enviar respuesta
  document.getElementById('btn-enviar-respuesta')?.addEventListener('click', async () => {
    const contenido = document.getElementById('respuesta-contenido')?.value?.trim();
    const feedback  = document.getElementById('respuesta-feedback');
    const btn       = document.getElementById('btn-enviar-respuesta');
    feedback.innerHTML = '';

    if (!contenido) {
      feedback.innerHTML = '<div class="alert alert-warning py-2 small mb-0">Escribe tu respuesta.</div>';
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Enviando...';

    try {
      const res  = await fetch('/api/foros/temas/' + _temaActualId + '/responder', {
        method:  'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ contenido })
      });
      const data = await res.json();

      if (data.ok) {
        document.getElementById('respuesta-contenido').value = '';
        verTema(_temaActualId); // recargar respuestas
      } else {
        feedback.innerHTML = `<div class="alert alert-danger py-2 small mb-0">${data.message}</div>`;
      }
    } catch (err) {
      feedback.innerHTML = '<div class="alert alert-danger py-2 small mb-0">Error de conexión.</div>';
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-send me-1"></i>Responder';
    }
  });

  // Cambio de empresa en selector de valoraciones
  document.getElementById('select-empresa-valorar')?.addEventListener('change', (e) => {
    loadValoraciones(e.target.value);
  });

  // Enviar valoración
  document.getElementById('btn-enviar-valoracion')?.addEventListener('click', async () => {
    const idEmpresa  = document.getElementById('select-empresa-valorar')?.value;
    const puntuacion = document.querySelector('input[name="puntuacion"]:checked')?.value;
    const comentario = document.getElementById('valoracion-comentario')?.value?.trim() || '';
    const feedback   = document.getElementById('valoracion-feedback');
    const btn        = document.getElementById('btn-enviar-valoracion');
    feedback.innerHTML = '';

    if (!idEmpresa) {
      feedback.innerHTML = '<div class="alert alert-warning py-2 small mb-0">Selecciona una empresa.</div>';
      return;
    }
    if (!puntuacion) {
      feedback.innerHTML = '<div class="alert alert-warning py-2 small mb-0">Selecciona una puntuación.</div>';
      return;
    }
    if (_session.user?.rol !== 'candidato') {
      feedback.innerHTML = '<div class="alert alert-warning py-2 small mb-0">Solo candidatos pueden valorar empresas.</div>';
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Enviando...';

    try {
      const res  = await fetch('/api/valoraciones/' + idEmpresa, {
        method:  'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ puntuacion: parseInt(puntuacion), comentario })
      });
      const data = await res.json();

      if (data.ok) {
        feedback.innerHTML = `<div class="alert alert-success py-2 small mb-0"><i class="bi bi-check-circle me-1"></i>${data.message}</div>`;
        document.getElementById('valoracion-comentario').value = '';
        document.querySelectorAll('input[name="puntuacion"]').forEach(r => r.checked = false);
      } else {
        feedback.innerHTML = `<div class="alert alert-danger py-2 small mb-0">${data.message}</div>`;
      }
    } catch (err) {
      feedback.innerHTML = '<div class="alert alert-danger py-2 small mb-0">Error de conexión.</div>';
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-send me-1"></i>Enviar valoración';
    }
  });
}

// Exponer globalmente para onclick handlers
window.verTema = verTema;
