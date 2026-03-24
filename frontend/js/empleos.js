
const pathCardEmpleo = '/templates/card-empleo.html';

const container_card_empleos = document.getElementById("container-card-empleos");

container_card_empleos.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-id-empledo]");
    if (btn) {
        loadEmpleoById(btn.getAttribute('data-id-empledo'));
    }
});



export function loadEmpleoById(idEmpleo) {
    alert(`empleo id ${idEmpleo}`);
    
}




const vacantes = [
  {
    id: 1,
    titulo: "Desarrollador Frontend",
    ubicacion: "Remoto (España)",
    salario: "35,000€ - 45,000€",
    tipoEmpleo: "Tiempo completo"
  },
  {
    id: 2,
    titulo: "Diseñador UX/UI",
    ubicacion: "Ciudad de México",
    salario: "$30,000 - $40,000 MXN",
    tipoEmpleo: "Híbrido"
  },
  {
    id: 3,
    titulo: "Data Analyst",
    ubicacion: "Buenos Aires, Argentina",
    salario: "A convenir",
    tipoEmpleo: "Proyecto / Freelance"
  },
  {
    id: 4,
    titulo: "Backend Developer (Node.js)",
    ubicacion: "Bogotá, Colombia",
    salario: "$8'000.000 COP",
    tipoEmpleo: "Tiempo completo"
  }
];

loadCardsEmpleos(vacantes);

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