
const pathCardEmpleo = '/templates/card-empleo.html';

const container_card_empleos = document.getElementById("container-card-empleos");

container_card_empleos.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-id-empledo]");
    if (btn) {
        loadEmpleoById(btn.getAttribute('data-id-empledo'));
    }
});



export function loadEmpleoById(idEmpleo) {
    window.location.href = `/usuario/detalle-vacante.html?id=${idEmpleo}`;
}




fetchAndLoadVacantes();

async function fetchAndLoadVacantes() {
  try {
    const res = await fetch('/api/vacantes', { credentials: 'include' });
    const data = await res.json();
    if (!data.ok) throw new Error(data.message);

    const vacantes = data.vacantes.map(v => ({
      id: v.id_vacante,
      titulo: v.titulo,
      ubicacion: v.ubicacion || 'El Salvador',
      salario: v.salario_min && v.salario_max
        ? `$${v.salario_min} - $${v.salario_max}`
        : 'A convenir',
      tipoEmpleo: v.tipo_contrato ? v.tipo_contrato.replace('_', ' ') : ''
    }));

    loadCardsEmpleos(vacantes);
  } catch (err) {
    console.error('Error cargando vacantes:', err);
  }
}

export async function loadCardsEmpleos(empleosDataList) {
    const TEXT_REPLACE = "{{}}";
    const cardEmpleoComp = await fetch(pathCardEmpleo).then(card => {return card.text()});
    const div_card_empleos = document.getElementById('container-card-empleos');
    div_card_empleos.innerHTML = "";

    for (const empleo of empleosDataList) {
        
		let cardEmpleoAdd = cardEmpleoComp.replace(TEXT_REPLACE, empleo.titulo)
			.replace(TEXT_REPLACE, empleo.ubicacion)
			.replace(TEXT_REPLACE, empleo.salario)
			.replace(TEXT_REPLACE, empleo.tipoEmpleo)
			.replace(TEXT_REPLACE, empleo.id) // para el ID del boton
			.replace(TEXT_REPLACE, empleo.id) // para la funcion del boton
			.replace(/<!--[\s\S]*?-->/, '');
      
		div_card_empleos.insertAdjacentHTML('beforeend', cardEmpleoAdd);
    }
};