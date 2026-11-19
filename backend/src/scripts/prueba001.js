require("dotenv").config({
  path: require("path").join(__dirname, "../../.env"),
});

const fs = require("fs");
const path = require("path");
const { leerExcelActivos } = require("../imports/activos/excel.reader");
const { normalizarExcel } = require("../imports/activos/excel.normalizer");
const { validarActivos } = require("../imports/activos/excel.validator");
const { importarActivos } = require("../imports/activos/excel.importer");

const linea = "=".repeat(52);
const segundos = (inicio) => ((Date.now() - inicio) / 1000).toFixed(1);

async function ejecutarMigracionCompleta() {
  const inicio = Date.now();

  try {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL no está definida. Revisa la ruta del archivo .env",
      );
    }

    console.log(`\n${linea}\n  MIGRACIÓN DE ACTIVOS · SIACT\n${linea}\n`);

    const rutaArchivo = path.join(
      __dirname,
      "../../../archivos/REPORTE-DEVOLUTIVOS-(1)-xlsx (1).xlsx",
    );

    console.log("[1/4] Leyendo Excel...");
    const filasCrudas = await leerExcelActivos(rutaArchivo);

    console.log("[2/4] Normalizando...");
    const filasNormalizadas = normalizarExcel(filasCrudas);

    console.log("[3/4] Validando...");
    const { validas, rechazadas, resumen } = validarActivos(filasNormalizadas);
    console.log(
      `      Válidos: ${resumen.totalValidos} | Rechazados: ${resumen.totalRechazados}`,
    );

    if (rechazadas.length > 0) {
      fs.writeFileSync(
        "rechazadas-validacion.json",
        JSON.stringify(rechazadas, null, 2),
      );
    }

    if (validas.length === 0) {
      console.log("\nNo hay registros válidos para importar.");
      return;
    }

    console.log("[4/4] Importando a Neon...");
    const r = await importarActivos(validas);

    if (r.erroresDb > 0) {
      fs.writeFileSync(
        "errores-importacion.json",
        JSON.stringify(r.detallesErrores, null, 2),
      );
    }

    console.log(`\n${linea}\n  RESULTADO FINAL\n${linea}`);
    console.log(`  Procesados : ${r.totalProcesados}`);
    console.log(`  Exitosos   : ${r.insertadosOActualizados}`);
    console.log(`  Errores    : ${r.erroresDb}`);
    console.log(`  Duración   : ${segundos(inicio)} s`);
    if (r.erroresDb > 0) console.log("  Detalle    : errores-importacion.json");
    console.log(`${linea}\n`);
  } catch (error) {
    console.error("\nError crítico en la migración:", error);
    process.exitCode = 1;
  } finally {
    process.exit(); // cierra el pool de conexiones para que el proceso termine
  }
}

ejecutarMigracionCompleta();
