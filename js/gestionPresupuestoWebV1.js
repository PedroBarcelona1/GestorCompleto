import { CrearGasto, anyadirGasto, listarGastos, borrarGasto, calcularTotalGastos } from "./gestionPresupuesto.js";

// Esperamos a que todo el DOM esté cargado antes de ejecutar el código
document.addEventListener("DOMContentLoaded", () => {

  // Seleccionamos la sección donde irá el formulario
  const seccionFormulario = document.getElementById("formularioGasto");

  // Creamos dinámicamente el formulario
  const form = document.createElement("form");

  // Definimos los campos del formulario
  form.innerHTML = `
  <input type="text" id="descripcion" placeholder="Descripción" required>
  <input type="number" id="valor" placeholder="Valor (€)" required>
  <input type="text" id="etiquetas" placeholder="Etiquetas (separadas por coma)">
  <button type="submit">Añadir gasto</button>
`;

  // Añadimos el formulario a la sección del DOM
  seccionFormulario.appendChild(form);

  // Evento al enviar el formulario
  form.addEventListener("submit", (e) => {
    e.preventDefault(); // evitamos que la página se recargue

    // Obtenemos los valores introducidos por el usuario
    const descripcion = document.getElementById("descripcion").value;
    const valor = parseFloat(document.getElementById("valor").value) || 0; // convertimos a número
    const etiquetas = document.getElementById("etiquetas").value
      .split(",")                   // separamos por comas
      .map(e => e.trim())           // eliminamos espacios
      .filter(e => e);              // eliminamos cadenas vacías

    // Creamos un nuevo gasto y lo añadimos a la lista de gastos
    anyadirGasto(new CrearGasto(descripcion, valor, new Date(), ...etiquetas));

    form.reset(); // limpiamos el formulario
    mostrarGastos(); // actualizamos la lista de gastos en pantalla
  });

  // Función para mostrar todos los gastos en pantalla
  function mostrarGastos() {
    const contenedor = document.getElementById("listadoGastos");
    contenedor.innerHTML = ""; // limpiamos el contenedor antes de mostrar

    // Recorremos cada gasto y creamos un div para mostrarlo
    listarGastos().forEach(gasto => {
      const div = document.createElement("div");
      div.className = "gasto-item";

      const fechaStr = new Date(gasto.fecha).toLocaleDateString("es-ES"); // formateamos la fecha

      div.innerHTML = `
        <div class="gasto-info">
          <strong>${gasto.descripcion}</strong> - ${gasto.valor} €<br>
          Fecha: ${fechaStr}<br>
          ${gasto.etiquetas.length ? gasto.etiquetas.join(", ") : ""}
        </div>
        <button class="borrar-btn">Borrar</button>
      `;

      // Añadimos funcionalidad al botón de borrar
      div.querySelector(".borrar-btn").addEventListener("click", () => {
        if (confirm(`¿Seguro que quieres borrar el gasto "${gasto.descripcion}"?`)) {
          borrarGasto(gasto.id); // eliminamos el gasto de la lista
          mostrarGastos();        // actualizamos la lista visible
        }
      });

      // Añadimos el div al contenedor
      contenedor.appendChild(div);
    });

    // Mostramos el total de gastos
    document.getElementById("totalGastos").textContent = `Total: ${calcularTotalGastos()} €`;
  }

  // Mostramos los gastos al cargar la página
  mostrarGastos();
});
