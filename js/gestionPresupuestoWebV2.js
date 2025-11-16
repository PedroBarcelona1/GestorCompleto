import { CrearGasto, listarGastos, anyadirGasto, borrarGasto, calcularTotalGastos } from "./gestionPresupuesto.js";

// Formulario de gastos
class FormularioGasto extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    // Definimos el formulario dentro del shadow DOM
    this.shadowRoot.innerHTML = `
      <form>
        <input type="text" name="descripcion" placeholder="Descripción" required />
        <input type="number" name="valor" placeholder="Valor (€)" required />
        <input type="text" name="etiquetas" placeholder="Etiquetas separadas por coma" />
        <button type="submit">Añadir gasto</button>
      </form>
    `;
  }

  connectedCallback() {
    // Evento al enviar el formulario
    this.shadowRoot.querySelector("form").onsubmit = e => {
      e.preventDefault(); // evitar recarga de página
      const data = new FormData(e.target);

      // Crear un nuevo gasto y añadirlo al listado
      anyadirGasto(new CrearGasto(
        data.get("descripcion"),
        parseFloat(data.get("valor")),
        new Date(),
        ...data.get("etiquetas").split(",").map(et => et.trim()).filter(Boolean)
      ));

      // Actualizar la lista de gastos en pantalla
      document.querySelector("lista-gastos").render();
      e.target.reset(); // limpiar el formulario
    };
  }
}
customElements.define("formulario-gasto", FormularioGasto);

// Lista de gastos 
class ListaGastos extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    // Contenedor para los gastos y total
    this.shadowRoot.innerHTML = `<div id="lista"></div><h3 id="total"></h3>`;
  }

  render() {
    const lista = this.shadowRoot.querySelector("#lista");
    lista.innerHTML = ""; // limpiar antes de renderizar
    // Crear un div por cada gasto
    listarGastos().forEach(g => {
      const div = document.createElement("div");
      div.textContent = `${g.descripcion} - ${g.valor}€ - ${g.etiquetas.join(", ")}`;
      // Botón para borrar el gasto
      const btn = document.createElement("button");
      btn.onclick = () => {
        borrarGasto(g.id); // eliminar del listado
        this.render();     // actualizar lista visible
      };
      div.appendChild(btn);
      lista.appendChild(div);
    });
    // Mostrar el total de todos los gastos
    this.shadowRoot.querySelector("#total").textContent = `Total: ${calcularTotalGastos()} €`;
  }
}
customElements.define("lista-gastos", ListaGastos);

// Guardar y cargar gastos en localStorage 
// Guardar gastos actuales
window.guardarGastos = () => 
  localStorage.setItem("gastos", JSON.stringify(listarGastos()));

// Recuperar gastos desde localStorage
window.cargarGastos = () => {
  const datos = localStorage.getItem("gastos");
  if (!datos) return; // si no hay datos guardados, salir
  // Limpiar gastos actuales
  listarGastos().forEach(g => borrarGasto(g.id));
  // Añadir los gastos recuperados (sin perder funcionalidades)
  JSON.parse(datos).forEach(g => anyadirGasto(g));
  // Actualizar la lista visible
  document.querySelector("lista-gastos").render();
};
