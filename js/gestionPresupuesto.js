let presupuesto = 0;
let gastos = [];
let idGasto = 0;

function actualizarPresupuesto(valor) {
  if (typeof valor === "number" && valor >= 0) {
    presupuesto = valor;
    return presupuesto;
  } else {
    console.error("Error: el valor debe ser un número no negativo");
    return -1;
  }
}

function mostrarPresupuesto() {
  return `Tu presupuesto actual es de ${presupuesto} €`;
}

function CrearGasto(descripcion, valor, fecha, ...etiquetas) {
  if (typeof valor !== "number" || valor < 0) valor = 0;

  let fechaValida = Date.parse(fecha);
  if (isNaN(fechaValida)) fechaValida = Date.now();

  this.descripcion = descripcion;
  this.valor = valor;
  this.fecha = fechaValida;
  this.etiquetas = [];

  this.anyadirEtiquetas = function (...nuevasEtiquetas) {
    for (let et of nuevasEtiquetas) {
      if (!this.etiquetas.includes(et)) this.etiquetas.push(et);
    }
  };

  this.borrarEtiquetas = function (...aBorrar) {
    this.etiquetas = this.etiquetas.filter((et) => !aBorrar.includes(et));
  };

  this.mostrarGasto = function () {
    return `Gasto correspondiente a ${this.descripcion} con valor ${this.valor} €`;
  };

  this.mostrarGastoCompleto = function () {
    let fechaStr = new Date(this.fecha).toLocaleString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    let texto = `Gasto correspondiente a ${this.descripcion} con valor ${this.valor} €.\n`;
    texto += `Fecha: ${fechaStr}\nEtiquetas:\n`;
    texto += this.etiquetas.map((et) => `- ${et}`).join("\n");
    return texto;
  };

  this.actualizarDescripcion = function (nuevaDescripcion) {
    this.descripcion = nuevaDescripcion;
  };

  this.actualizarValor = function (nuevoValor) {
    if (typeof nuevoValor === "number" && nuevoValor >= 0)
      this.valor = nuevoValor;
  };

  this.actualizarFecha = function (nuevaFecha) {
    let nueva = Date.parse(nuevaFecha);
    if (!isNaN(nueva)) this.fecha = nueva;
  };

  this.obtenerPeriodoAgrupacion = function (periodo) {
    let d = new Date(this.fecha);
    if (periodo === "dia") {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(d.getDate()).padStart(2, "0")}`;
    } else if (periodo === "mes") {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    } else if (periodo === "anyo") {
      return `${d.getFullYear()}`;
    } else {
      return null;
    }
  };

  this.anyadirEtiquetas(...etiquetas);
}


function listarGastos() {
  return gastos;
}

function anyadirGasto(gasto) {
  gasto.id = idGasto++;
  gastos.push(gasto);
}

function borrarGasto(id) {
  gastos = gastos.filter((g) => g.id !== id);
}

function calcularTotalGastos() {
  return gastos.reduce((total, g) => total + g.valor, 0);
}

function calcularBalance() {
  return presupuesto - calcularTotalGastos();
}

function filtrarGastos({
  fechaDesde,
  fechaHasta,
  valorMinimo,
  valorMaximo,
  descripcionContiene,
  etiquetasTiene,
} = {}) {
  return gastos.filter((g) => {
    const fechaGasto =
      typeof g.fecha === "number" ? g.fecha : Date.parse(g.fecha);

    if (fechaDesde && fechaGasto < Date.parse(fechaDesde)) return false;
    if (fechaHasta && fechaGasto > Date.parse(fechaHasta)) return false;
    if (valorMinimo != null && g.valor < valorMinimo) return false;
    if (valorMaximo != null && g.valor > valorMaximo) return false;

    if (
      descripcionContiene &&
      !g.descripcion.toLowerCase().includes(descripcionContiene.toLowerCase())
    )
      return false;

    if (etiquetasTiene && etiquetasTiene.length > 0) {
      const etiquetasGasto = g.etiquetas.map((e) => e.toLowerCase());
      const etiquetasFiltro = etiquetasTiene.map((e) => e.toLowerCase());
      const coincide = etiquetasFiltro.some((etq) =>
        etiquetasGasto.includes(etq)
      );
      if (!coincide) return false;
    }

    return true;
  });
}

function agruparGastos(periodo = "mes", etiquetas = [], fechaDesde, fechaHasta) {
  const fechaActual = new Date().toISOString().split("T")[0];

  const gastosFiltrados = filtrarGastos({
    fechaDesde,
    fechaHasta: fechaHasta || fechaActual,
    etiquetasTiene: etiquetas,
  });

  const resultado = gastosFiltrados.reduce((acc, gasto) => {
    const clave = gasto.obtenerPeriodoAgrupacion(periodo);
    if (!acc[clave]) acc[clave] = 0;
    acc[clave] += gasto.valor;
    return acc;
  }, {});

  return resultado;
}

export {
  presupuesto,
  actualizarPresupuesto,
  mostrarPresupuesto,
  CrearGasto,
  listarGastos,
  anyadirGasto,
  borrarGasto,
  calcularTotalGastos,
  calcularBalance,
  filtrarGastos,
  agruparGastos,
};
