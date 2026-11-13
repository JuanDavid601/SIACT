/**
 * Valida un array de filas normalizadas de activos antes de importarlas a la base de datos.
 * @param {Array} filasNormalizadas - Filas procesadas por el normalizador.
 * @returns {Object} Objeto con las filas válidas, filas con errores y un resumen.
 */

function validarActivos(filasNormalizadas) {
  console.log(
    `[excel.validator] Iniciando validación de ${filasNormalizadas.length} registros...`,
  );

  const validas = [];
  const rechazadas = [];

  // Conjunto para detectar duplicados de códigos de barras dentro del propio Excel
  const codigosBarrasVistos = new Set();
  const placasVistas = new Set();

  for (const fila of filasNormalizadas) {
    const errores = [];

    // 1. Validar campos mínimos obligatorios según el negocio
    if (!fila.placa) {
      errores.push("Falta el número de placa institucional.");
    }

    if (!fila.codBarras) {
      errores.push("Falta el código de barras.");
    } else {
      // 2. Validar duplicados de codBarras en el Excel
      const codBarrasUpper = fila.codBarras.toUpperCase();
      if (codigosBarrasVistos.has(codBarrasUpper)) {
        errores.push(
          `Código de barras duplicado dentro del archivo: ${fila.codBarras}`,
        );
      } else {
        codigosBarrasVistos.add(codBarrasUpper);
      }
    }

    // Validación opcional de placa duplicada en el Excel (si aplica)
    if (fila.placa) {
      const placaStr = fila.placa.toString().toUpperCase();
      if (placasVistas.has(placaStr)) {
        // Dependiendo de tu regla, puedes considerarlo advertencia o error.
        // Aquí lo registramos como advertencia/error leve si se repite la placa.
        // (Comenta la siguiente línea si es normal que se repita la placa en algún caso especial)
        // errores.push(`Placa duplicada dentro del archivo: ${fila.placa}`);
      } else {
        placasVistas.add(placaStr);
      }
    }

    // Si hay errores, mandamos la fila a la lista de rechazadas con sus motivos
    if (errores.length > 0) {
      rechazadas.push({
        filaOriginal: fila.filaOriginal,
        placa: fila.placa || "N/A",
        codBarras: fila.codBarras || "N/A",
        motivos: errores,
      });
    } else {
      validas.push(fila);
    }
  }

  const resumen = {
    totalLeidos: filasNormalizadas.length,
    totalValidos: validas.length,
    totalRechazados: rechazadas.length,
  };

  console.log(`[excel.validator] Validación finalizada:`, resumen);

  return {
    validas,
    rechazadas,
    resumen,
  };
}

module.exports = { validarActivos };
