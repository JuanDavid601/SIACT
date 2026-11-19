// Convierte diferentes formatos de fecha del Excel a un objeto Date de JavaScript o null.
function parsearFecha(valor) {
  if (!valor) return null;

  // Si ya es un objeto Date
  if (valor instanceof Date) {
    return isNaN(valor.getTime()) ? null : valor;
  }

  // Si es un número (formato de fecha serial de Excel)
  if (typeof valor === "number") {
    // Excel cuenta los días desde el 1 de enero de 1900 (con un pequeño ajuste por el año bisiesto 1900)
    const fechaEpoch = new Date(
      Math.round((valor - (25567 + 2)) * 86400 * 1000),
    );
    return isNaN(fechaEpoch.getTime()) ? null : fechaEpoch;
  }

  // Si es un string (ej: "01/01/19" o "25/10/2021")
  if (typeof valor === "string") {
    const str = valor.trim();
    if (str === "" || str === "NaN") return null;

    // Intentar parsear formato DD/MM/YYYY o DD/MM/YY
    const partes = str.split("/");
    if (partes.length === 3) {
      let dia = parseInt(partes[0], 10);
      let mes = parseInt(partes[1], 10) - 1; // Los meses en JS van de 0 a 11
      let anio = parseInt(partes[2], 10);

      // Ajustar años de 2 dígitos (ej: "19" -> 2019 o 1919)
      if (anio < 100) {
        anio += anio < 50 ? 2000 : 1900;
      }

      const fecha = new Date(anio, mes, dia);
      return isNaN(fecha.getTime()) ? null : fecha;
    }

    // Intento genérico por si es otro formato de string estándar
    const fechaGenerica = new Date(str);
    return isNaN(fechaGenerica.getTime()) ? null : fechaGenerica;
  }

  return null;
}

// Normaliza un valor de texto (elimina espacios y maneja vacíos como null).

function normalizarTexto(valor) {
  if (valor === null || valor === undefined) return null;
  const str = valor.toString().trim();
  return str === "" || str.toUpperCase() === "NAN" ? null : str;
}

// Normaliza una fila completa del Excel de activos.

function normalizarFila(row, index) {
  return {
    filaOriginal: index + 2, // +2 asumiendo fila 1 de encabezados
    tipoDependencia: normalizarTexto(row["TIPO_DEPENDENCIA"]),
    codigoTipoDependencia: normalizarTexto(row["NOMBRE_TIPO_DEPENDENCIA"]),
    codigoDependencia: normalizarTexto(row["DEPENDENCIA"]),
    nombreDependencia: normalizarTexto(row["NOMBRE_DEPENDENCIA"]),

    nombreInventario: normalizarTexto(row["NOMBRE_INVENTARIO"]),
    descripcion: normalizarTexto(row["DESCRIPCION"]),

    fechaIngresoBien: parsearFecha(row["FECHA_INGRESO_BIEN"]),
    fechaEntrada: parsearFecha(row["FECHAENTRADA"]),
    fechaActivacion: parsearFecha(row["FECHA_ACTIVACION"]),

    estado: normalizarTexto(row["ESTADO"]),
    terceroType: normalizarTexto(row["TERCERO_TYPE"]),
    nombreTercero: normalizarTexto(row["NOMBRE_TERCERO"]),

    codBarras: normalizarTexto(row["COD_BARRAS"]),
    estadoUso: normalizarTexto(row["ESTADO_USO"]),
    placa: normalizarTexto(row["PLACA"]),
    marca: normalizarTexto(row["MARCA"]),
    serial: normalizarTexto(row["SERIAL"]),
  };
}

// Recibe un array de filas crudas y devuelve un array de filas normalizadas.

function normalizarExcel(rows) {
  console.log(
    `[excel.normalizer] Iniciando normalización de ${rows.length} registros...`,
  );
  const normalizadas = rows.map((row, index) => normalizarFila(row, index));
  console.log(`[excel.normalizer] Normalización completada con éxito.`);
  return normalizadas;
}

module.exports = { normalizarExcel, normalizarFila };
