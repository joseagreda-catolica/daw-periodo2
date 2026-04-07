const tipoIcono = {
  guia:     'bi-book',
  video:    'bi-play-circle',
  articulo: 'bi-file-earmark-text'
};

async function loadRecursos() {
  try {
    const res = await fetch('/api/recursos', { credentials: 'include' });
    const data = await res.json();
    if (!data.ok) throw new Error(data.message);

    const container = document.getElementById('container-recursos');
    if (!container) return;

    if (!data.recursos || data.recursos.length === 0) {
      container.innerHTML = '<p class="text-secondary">No hay recursos disponibles.</p>';
      return;
    }

    container.innerHTML = data.recursos.map(r => {
      const icono = tipoIcono[r.tipo] || 'bi-file-earmark';
      const url = r.url_contenido || '#';
      return `
        <div class="card-recurso bg-body-tertiary border border-2 rounded-2 p-2">
          <div class="d-flex justify-content-center align-items-center bg-beige-suave rounded-2 p-3" style="height:100px;">
            <i class="bi ${icono} fs-1 text-secondary"></i>
          </div>
          <p class="mt-3 mb-1 text-center fw-semibold">${r.titulo}</p>
          <p class="small text-center">${r.descripcion || ''}</p>
          <div class="d-flex">
            <a href="${url}" target="_blank" class="btn btn-warning mx-auto">Ver recurso</a>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('Error cargando recursos:', err);
  }
}

loadRecursos();
