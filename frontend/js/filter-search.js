// Conecta el formulario de búsqueda al endpoint GET /api/vacantes
// El formulario ya existe en empleos.html — solo adjuntamos el listener

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#container-filter form');
  if (!form) return;

  // Leer parámetros de URL y prellenar el formulario
  const params = new URLSearchParams(window.location.search);
  const buscarVal = params.get('buscar');
  const ubicacionVal = params.get('ubicacion');
  const tipoVal = params.get('tipo');
  const nivelVal = params.get('nivel');
  const salarioVal = params.get('salario_min');

  if (buscarVal) form.querySelector('[name="buscar"]').value = buscarVal;
  if (ubicacionVal) form.querySelector('[name="ubicacion"]').value = ubicacionVal;
  if (tipoVal) form.querySelector('[name="tipo"]').value = tipoVal;
  if (nivelVal) form.querySelector('[name="nivel"]').value = nivelVal;
  if (salarioVal) form.querySelector('[name="salario_min"]').value = salarioVal;

  // Si hay parámetros en URL, ejecutar búsqueda automáticamente
  if (buscarVal || ubicacionVal || tipoVal || nivelVal || salarioVal) {
    setTimeout(() => form.dispatchEvent(new Event('submit')), 100);
  }

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
