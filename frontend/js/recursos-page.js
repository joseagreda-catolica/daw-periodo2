const tipoConfig = {
  guia:     { icono: 'bi-book-fill',          bg: '#eef2ff', color: '#2e3266' },
  video:    { icono: 'bi-play-circle-fill',   bg: '#fef2f2', color: '#dc2626' },
  articulo: { icono: 'bi-file-earmark-text-fill', bg: '#ecfdf5', color: '#059669' }
};

async function loadRecursos() {
  try {
    const res = await fetch('/api/recursos', { credentials: 'include' });
    const data = await res.json();
    if (!data.ok) throw new Error(data.message);

    const container = document.getElementById('container-recursos');
    if (!container) return;

    if (!data.recursos || data.recursos.length === 0) {
      container.innerHTML = '<div class="col-12 text-center py-5"><p class="text-muted">No hay recursos disponibles.</p></div>';
      return;
    }

    container.innerHTML = data.recursos.map(r => {
      const cfg = tipoConfig[r.tipo] || { icono: 'bi-file-earmark', bg: '#f3f4f6', color: '#6b7280' };
      const url = r.url_contenido || '#';
      const tipoLabel = r.tipo ? r.tipo.charAt(0).toUpperCase() + r.tipo.slice(1) : 'Recurso';
      return `
        <div class="col-md-4">
          <div class="bg-white border-0 rounded-3 shadow-sm h-100 overflow-hidden" style="border-top: 4px solid ${cfg.color} !important; border: 1px solid #eef0f5;">
            <div class="d-flex align-items-center justify-content-center" style="height:90px;background:${cfg.bg};">
              <i class="bi ${cfg.icono}" style="font-size:2.4rem;color:${cfg.color};"></i>
            </div>
            <div class="p-4">
              <span style="font-size:0.68rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${cfg.color};">${tipoLabel}</span>
              <h6 class="fw-bold mt-1 mb-2" style="color:#1a1d2e;">${r.titulo}</h6>
              <p class="small text-muted mb-3" style="line-height:1.5;">${r.descripcion || ''}</p>
              <a href="${url}" target="_blank" class="btn btn-warning btn-sm rounded-pill px-4 fw-semibold">
                <i class="bi bi-box-arrow-up-right me-1"></i>Ver recurso
              </a>
            </div>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('Error cargando recursos:', err);
  }
}

loadRecursos();
