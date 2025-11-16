// Variables globales
let presupuesto = 0;   // Presupuesto total disponible
let gastos = [];       // Lista de objetos gasto
let idGasto = 0;       // Contador de IDs para cada gasto

// Funciones de presupuesto
/**
 * Actualiza el valor del presupuesto.
 * Devuelve el presupuesto actualizado o -1 si es inválido.
 */
function actualizarPresupuesto(valor) {
  if (typeof valor === "number" && valor >= 0) {
    presupuesto = valor;
    return presupuesto;
  } else {
    console.error("Error: el valor debe ser un número no negativo");
    return -1;
  }
}

// Devuelve un string mostrando el presupuesto actual.
function mostrarPresupuesto() {
  return `Tu presupuesto actual es de ${presupuesto} €`;
}

// Constructor de gastos
/** 
 * Constructor de gasto
 * @param descripcion - Descripción del gasto
 * @param valor - Valor del gasto
 * @param fecha - Fecha del gasto
 * @param etiquetas - Etiquetas opcionales
 */
function CrearGasto(descripcion, valor, fecha, ...etiquetas) {
  // Validar valor
  if (typeof valor !== "number" || valor < 0) valor = 0;

  // Validar fecha
  let fechaValida = Date.parse(fecha);
  if (isNaN(fechaValida)) fechaValida = Date.now();

  this.descripcion = descripcion;
  this.valor = valor;
  this.fecha = fechaValida;
  this.etiquetas = [];

  // Métodos para gestionar etiquetas
  this.anyadirEtiquetas = function (...nuevasEtiquetas) {
    for (let et of nuevasEtiquetas) {
      if (!this.etiquetas.includes(et)) this.etiquetas.push(et);
    }
  };

  this.borrarEtiquetas = function (...aBorrar) {
    this.etiquetas = this.etiquetas.filter((et) => !aBorrar.includes(et));
  };

  // Métodos para mostrar información del gasto
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

  // Métodos para actualizar campos
  this.actualizarDescripcion = function (nuevaDescripcion) {
    this.descripcion = nuevaDescripcion;
  };

  this.actualizarValor = function (nuevoValor) {
    if (typeof nuevoValor === "number" && nuevoValor >= 0) this.valor = nuevoValor;
  };

  this.actualizarFecha = function (nuevaFecha) {
    let nueva = Date.parse(nuevaFecha);
    if (!isNaN(nueva)) this.fecha = nueva;
  };

  // Obtener clave de agrupación (día, mes o año)
  this.obtenerPeriodoAgrupacion = function (periodo) {
    let d = new Date(this.fecha);
    if (periodo === "dia") {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    } else if (periodo === "mes") {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    } else if (periodo === "anyo") {
      return `${d.getFullYear()}`;
    } else {
      return null;
    }
  };

  // Añadir etiquetas iniciales
  this.anyadirEtiquetas(...etiquetas);
}

// Funciones de gestión de gastos
function listarGastos() {
  return gastos;
}

function anyadirGasto(gasto) {
  gasto.id = idGasto++;  // Asignar ID único
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

// Función para filtrar gastos
function filtrarGastos({ fechaDesde, fechaHasta, valorMinimo, valorMaximo, descripcionContiene, etiquetasTiene } = {}) {
  return gastos.filter((g) => {
    const fechaGasto = typeof g.fecha === "number" ? g.fecha : Date.parse(g.fecha);
    if (fechaDesde && fechaGasto < Date.parse(fechaDesde)) return false;
    if (fechaHasta && fechaGasto > Date.parse(fechaHasta)) return false;
    if (valorMinimo != null && g.valor < valorMinimo) return false;
    if (valorMaximo != null && g.valor > valorMaximo) return false;

    if (descripcionContiene && !g.descripcion.toLowerCase().includes(descripcionContiene.toLowerCase())) return false;

    if (etiquetasTiene && etiquetasTiene.length > 0) {
      const etiquetasGasto = g.etiquetas.map(e => e.toLowerCase());
      const etiquetasFiltro = etiquetasTiene.map(e => e.toLowerCase());
      const coincide = etiquetasFiltro.some(etq => etiquetasGasto.includes(etq));
      if (!coincide) return false;
    }

    return true;
  });
}

// Función para agrupar gastos
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

// Función para sobrescribir todos los gastos (usada para recuperar de localStorage)
function sobrescribirGastos(nuevoListado) {
  gastos = [];    // Vaciar listado actual
  idGasto = 0;    // Reiniciar IDs

  // Reconstruir objetos completos a partir de datos planos
  nuevoListado.forEach(g => anyadirGasto(new CrearGasto(
    g.descripcion,
    g.valor,
    g.fecha,
    ...(g.etiquetas || [])
  )));
}

// Exportaciones
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
  sobrescribirGastos,   // <-- nueva función
};
