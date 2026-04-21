const pathCardEmpleo = '/templates/card-empleo.html';

const container_card_empleos = document.getElementById('container-card-empleos');

// ── Click en tarjeta → cargar detalle en panel derecho ────────────────────────
container_card_empleos.addEventListener('click', (event) => {
  const btn = event.target.closest('[data-id-empleo]');
  if (btn) {
    loadEmpleoById(btn.getAttribute('data-id-empleo'));
  }
});

export async function loadEmpleoById(idEmpleo) {
  try {
    const res  = await fetch(`/api/vacantes/${idEmpleo}`, { credentials: 'include' });
    const data = await res.json();
    if (!data.ok) throw new Error(data.message);

    const { vacante, yaPostulado } = data;

    // Panel derecho: cabecera
    const elTitulo   = document.getElementById('detail-titulo');
    const elEmpresa  = document.getElementById('detail-empresa');
    const elUbicacion = document.getElementById('detail-ubicacion-header');
    if (elTitulo)   elTitulo.textContent  = vacante.titulo;
    if (elEmpresa)  elEmpresa.textContent = vacante.nombre_empresa || '';
    if (elUbicacion) elUbicacion.textContent = vacante.ubicacion || '';

    // Chips (tipo, salario, ubicacion)
    const elChips = document.getElementById('detail-chips');
    if (elChips) {
      const salario = vacante.salario_min && vacante.salario_max
        ? `$${vacante.salario_min} - $${vacante.salario_max}`
        : 'A convenir';
      const tipo = vacante.tipo_contrato
        ? vacante.tipo_contrato.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        : '';
      const nivel = vacante.nivel_experiencia
        ? vacante.nivel_experiencia.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        : '';
      elChips.innerHTML = `
        <span class="meta-chip"><i class="bi bi-geo-alt-fill text-danger"></i> ${vacante.ubicacion || 'El Salvador'}</span>
        <span class="meta-chip"><i class="bi bi-clock-fill" style="color:#2e3266;"></i> ${tipo}</span>
        <span class="meta-chip"><i class="bi bi-cash-coin text-warning"></i> ${salario}</span>
        <span class="meta-chip"><i class="bi bi-bar-chart-fill" style="color:#059669;"></i> ${nivel}</span>
      `;
    }

    // Descripción
    const elDesc = document.getElementById('detail-descripcion');
    if (elDesc) {
      elDesc.textContent = vacante.descripcion || 'Sin descripción disponible.';
    }

    // Botón postular
    const btnPostular = document.getElementById('btn-postular-empleos');
    if (btnPostular) {
      btnPostular.dataset.idVacante = vacante.id_vacante;

      if (yaPostulado) {
        btnPostular.disabled = true;
        btnPostular.textContent = '✓ Ya postulado';
        btnPostular.classList.remove('btn-warning');
        btnPostular.classList.add('btn-secondary');
        btnPostular.removeAttribute('data-bs-toggle');
        btnPostular.removeAttribute('data-bs-target');
      } else {
        btnPostular.disabled = false;
        btnPostular.innerHTML = '<i class="bi bi-send-fill me-1"></i>Postularme';
        btnPostular.classList.remove('btn-secondary');
        btnPostular.classList.add('btn-warning');
        btnPostular.setAttribute('data-bs-toggle', 'modal');
        btnPostular.setAttribute('data-bs-target', '#modalPostularEmpleos');
      }
    }

    // Mostrar el panel
    const detailPanel = document.getElementById('detail-panel-content');
    if (detailPanel) detailPanel.style.display = '';

    const detailPlaceholder = document.getElementById('detail-placeholder');
    if (detailPlaceholder) detailPlaceholder.style.display = 'none';

  } catch (err) {
    console.error('Error cargando vacante:', err);
  }
}

// ── Render tarjetas ───────────────────────────────────────────────────────────
export async function loadCardsEmpleos(empleosDataList) {
  const cardEmpleoComp = await fetch(pathCardEmpleo).then(r => r.text());
  const div = document.getElementById('container-card-empleos');
  div.innerHTML = '';

  if (!empleosDataList || empleosDataList.length === 0) {
    div.innerHTML = '<p class="text-muted small text-center py-4">No se encontraron empleos.</p>';
    return;
  }

  for (const empleo of empleosDataList) {
    let card = cardEmpleoComp
      .replaceAll('{{titulo}}', empleo.titulo)
      .replaceAll('{{ubicacion}}', empleo.ubicacion)
      .replaceAll('{{tipo}}', empleo.tipoEmpleo)
      .replaceAll('{{salario}}', empleo.salario)
      .replaceAll('{{id}}', empleo.id)
      .replace(/<!--[\s\S]*?-->/, '');
    div.insertAdjacentHTML('beforeend', card);
  }
}

// Exponer globalmente para filter-search.js
window.renderCardsEmpleos = loadCardsEmpleos;

// ── Carga inicial ─────────────────────────────────────────────────────────────
fetchAndLoadVacantes();

async function fetchAndLoadVacantes() {
  try {
    const res  = await fetch('/api/vacantes', { credentials: 'include' });
    const data = await res.json();
    if (!data.ok) throw new Error(data.message);

    const vacantes = data.vacantes.map(v => ({
      id:         v.id_vacante,
      titulo:     v.titulo,
      ubicacion:  v.ubicacion || 'El Salvador',
      salario:    v.salario_min && v.salario_max
                    ? `$${v.salario_min} - $${v.salario_max}`
                    : 'A convenir',
      tipoEmpleo: v.tipo_contrato ? v.tipo_contrato.replace(/_/g, ' ') : ''
    }));

    loadCardsEmpleos(vacantes);
  } catch (err) {
    console.error('Error cargando vacantes:', err);
  }
}

// ── Modal postulación desde panel derecho ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const btnEnviar = document.getElementById('btn-enviar-postulacion-empleos');
  if (!btnEnviar) return;

  btnEnviar.addEventListener('click', async () => {
    const btnPostular = document.getElementById('btn-postular-empleos');
    const idVacante   = btnPostular?.dataset?.idVacante;
    const carta       = document.getElementById('carta-empleos')?.value?.trim() || '';
    const feedback    = document.getElementById('modal-feedback-empleos');

    if (!idVacante) return;

    btnEnviar.disabled = true;
    btnEnviar.textContent = 'Enviando...';

    try {
      const res  = await fetch(`/api/vacantes/${idVacante}/postular`, {
        method:  'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ carta_presentacion: carta })
      });
      const data = await res.json();

      if (res.status === 401) {
        window.location.href = '/usuario/usuario-login.html';
        return;
      }

      if (data.ok) {
        bootstrap.Modal.getInstance(document.getElementById('modalPostularEmpleos'))?.hide();
        loadEmpleoById(idVacante); // recargar para mostrar "Ya postulado"
      } else {
        if (feedback) feedback.innerHTML = `<div class="alert alert-danger py-2 small mb-2">${data.message}</div>`;
        btnEnviar.disabled = false;
        btnEnviar.textContent = 'Enviar Postulación';
      }
    } catch (err) {
      console.error(err);
      btnEnviar.disabled = false;
      btnEnviar.textContent = 'Enviar Postulación';
    }
  });
});
