import {
  CrearGasto,
  listarGastos,
  anyadirGasto,
  borrarGasto,
  calcularTotalGastos
} from "./gestionPresupuesto.js";

class FormularioGasto extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
  form {
    background-color: #fff;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 300px;
  }
  input, button {
    padding: 8px;
    border-radius: 5px;
    border: 1px solid #ccc;
    font-size: 14px;
  }
  button {
    background-color: black;
    color: white;
    border: none;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  button:hover {
    background-color: #333;
  }
</style>

      <form>
        <input type="text" name="descripcion" placeholder="Descripción" required />
        <input type="number" name="valor" placeholder="Valor (€)" required />
        <input type="text" name="etiquetas" placeholder="Etiquetas separadas por coma" />
        <button type="submit">Añadir gasto</button>
      </form>
    `;
  }

  connectedCallback() {
    this.shadowRoot.querySelector("form").addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(e.target);
      const gasto = new CrearGasto(
        data.get("descripcion"),
        parseFloat(data.get("valor")),
        new Date(),
        ...data.get("etiquetas").split(",").map(et => et.trim()).filter(Boolean)
      );

      anyadirGasto(gasto);
      this.dispatchEvent(new CustomEvent("nuevo-gasto", { bubbles: true }));
      e.target.reset();
    });
  }
}
customElements.define("formulario-gasto", FormularioGasto);

class MiGasto extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
        .gasto {
          background-color: #fff;
          padding: 10px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .etiqueta {
          display: inline-block;
          background-color: #e0e0e0;
          color: #555;
          border-radius: 5px;
          padding: 2px 6px;
          margin-right: 4px;
          font-size: 12px;
        }
        button {
          background-color: #f44336;
          color: white;
          border: none;
          border-radius: 5px;
          padding: 5px 10px;
          cursor: pointer;
        }
        button:hover {
          background-color: #d32f2f;
        }
      </style>

      <div class="gasto">
        <div class="info"></div>
        <button class="borrar">🗑️</button>
      </div>
    `;
  }

  set gasto(value) {
    this._gasto = value;
    this.render();
  }

  render() {
    const infoDiv = this.shadowRoot.querySelector(".info");
    const etiquetasHTML = this._gasto.etiquetas
      .map(et => `<span class="etiqueta">${et}</span>`)
      .join("");
    infoDiv.innerHTML = `
      <strong>${this._gasto.descripcion}</strong><br>
      ${this._gasto.valor}€ - ${new Date(this._gasto.fecha).toLocaleDateString()}
      <div>${etiquetasHTML}</div>
    `;
    this.shadowRoot.querySelector(".borrar").onclick = () => {
      borrarGasto(this._gasto.id);
      this.dispatchEvent(new CustomEvent("borrar-gasto", { bubbles: true }));
    };
  }
}
customElements.define("mi-gasto", MiGasto);

class ListaGastos extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <div id="lista"></div>
      <h3 id="total"></h3>
    `;
  }

  connectedCallback() {
    this.render();
    this.addEventListener("nuevo-gasto", () => this.render());
    this.addEventListener("borrar-gasto", () => this.render());
  }

  render() {
    const lista = this.shadowRoot.querySelector("#lista");
    lista.innerHTML = "";

    listarGastos().forEach((g) => {
      const item = document.createElement("mi-gasto");
      item.gasto = g;
      lista.appendChild(item);
    });

    this.shadowRoot.querySelector("#total").textContent = 
      `Total: ${calcularTotalGastos()} €`;
  }
}
customElements.define("lista-gastos", ListaGastos);
