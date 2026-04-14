// Conecta el formulario de búsqueda al endpoint GET /api/vacantes
// El formulario ya existe en empleos.html — solo adjuntamos el listener

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#container-filter form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const buscar    = form.querySelector('[name="buscar"]')?.value?.trim()    || '';
    const ubicacion = form.querySelector('[name="ubicacion"]')?.value?.trim() || '';
    const tipo      = form.querySelector('[name="tipo"]')?.value              || '';
    const nivel     = form.querySelector('[name="nivel"]')?.value             || '';
    const salario   = form.querySelector('[name="salario_min"]')?.value       || '';

    const params = new URLSearchParams();
    if (buscar)    params.set('search',      buscar);
    if (ubicacion) params.set('ubicacion',   ubicacion);
    if (tipo)      params.set('tipo',        tipo);
    if (nivel)     params.set('nivel',       nivel);
    if (salario)   params.set('salario_min', salario);

    try {
      const res  = await fetch('/api/vacantes?' + params.toString(), { credentials: 'include' });
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

      if (window.renderCardsEmpleos) {
        window.renderCardsEmpleos(vacantes);
      }
    } catch (err) {
      console.error('Error en búsqueda:', err);
    }
  });
});
