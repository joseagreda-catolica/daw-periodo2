
const pathBuscarEmpleoComp = '/templates/buscar-empleo.html';
const container_filter_dom = document.getElementById("container-filter");

loadFilterSearch();

export async function loadFilterSearch() {
    console.log('ok');
    
    const comp_buscar_empleo = await fetch(pathBuscarEmpleoComp);
    const html = await comp_buscar_empleo.text();
    container_filter_dom.innerHTML = html;
    console.log('ok2');
    
    const div_filters = document.getElementById("div-filtros");
    const btn_show_filter = document.getElementById("btn-show-filters");
    const btn_close_filter = document.getElementById("btn-close-filters");
    btn_show_filter.addEventListener('click', () => {div_filters.style.display = "";});
    btn_close_filter.addEventListener('click', () => {div_filters.style.display = "none";});
    
};