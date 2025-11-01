import { CrearGasto, anyadirGasto, listarGastos, borrarGasto, calcularTotalGastos } from "./gestionPresupuesto.js";

document.addEventListener("DOMContentLoaded", () => {
  const seccionFormulario = document.getElementById("formularioGasto");
  const form = document.createElement("form");

  form.innerHTML = `
    <input type="text" id="descripcion" placeholder="Descripción" required>
    <input type="number" id="valor" placeholder="Valor (€)" required>
    <input type="text" id="etiquetas" placeholder="Etiquetas (separadas por coma)">
    <button type="submit">Añadir gasto</button>
  `;
  seccionFormulario.appendChild(form);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const descripcion = document.getElementById("descripcion").value;
    const valor = parseFloat(document.getElementById("valor").value) || 0;
    const etiquetas = document.getElementById("etiquetas").value
      .split(",").map(e => e.trim()).filter(e => e);
    anyadirGasto(new CrearGasto(descripcion, valor, new Date(), ...etiquetas));
    form.reset();
    mostrarGastos();
  });

  function mostrarGastos() {
    const contenedor = document.getElementById("listadoGastos");
    contenedor.innerHTML = "";
    listarGastos().forEach(gasto => {
      const div = document.createElement("div");
      div.className = "gasto-item";

      const fechaStr = new Date(gasto.fecha).toLocaleDateString("es-ES");

      div.innerHTML = `
        <div class="gasto-info">
          <strong>${gasto.descripcion}</strong> - ${gasto.valor} €<br>
          Fecha: ${fechaStr}<br>
          ${gasto.etiquetas.length ? gasto.etiquetas.join(", ") : ""}
        </div>
        <button class="borrar-btn">Borrar</button>
      `;

      div.querySelector(".borrar-btn").addEventListener("click", () => {
        if (confirm(`¿Seguro que quieres borrar el gasto "${gasto.descripcion}"?`)) {
          borrarGasto(gasto.id);
          mostrarGastos();
        }
      });

      contenedor.appendChild(div);
    });

    document.getElementById("totalGastos").textContent = `Total: ${calcularTotalGastos()} €`;
  }

  mostrarGastos();
});
