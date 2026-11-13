const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

// Configurar el pool de conexión con la URL exacta del entorno y soporte estricto de SSL/Channel Binding
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Importa los activos válidos a la base de datos de Neon usando Prisma.
 * Gestiona automáticamente las dependencias y realiza operaciones seguras (upsert).
 * @param {Array} filasValidas - Filas que pasaron exitosamente la validación.
 * @returns {Object} Resumen detallado de la importación.
 */
async function importarActivos(filasValidas) {
  console.log(
    `[excel.importer] Iniciando inserción de ${filasValidas.length} activos en la base de datos...`,
  );

  let insertadosOActualizados = 0;
  let erroresDb = 0;
  const detallesErrores = [];

  let contador = 0;
  for (const fila of filasValidas) {
    contador++;
    if (contador % 500 === 0) {
      console.log(
        `[excel.importer] Procesados ${contador} de ${filasValidas.length} registros...`,
      );
    }

    try {
      let dependenciaId = null;

      // 1. Gestionar Dependencia de forma segura
      if (
        fila.codigoDependencia &&
        fila.codigoTipoDependencia &&
        String(fila.codigoDependencia).trim() !== "" &&
        String(fila.codigoTipoDependencia).trim() !== ""
      ) {
        try {
          const dependencia = await prisma.dependencia.upsert({
            where: {
              codigoDependencia_codigoTipoDependencia: {
                codigoDependencia: String(fila.codigoDependencia).trim(),
                codigoTipoDependencia: String(
                  fila.codigoTipoDependencia,
                ).trim(),
              },
            },
            update: {
              tipoDependencia: fila.tipoDependencia
                ? String(fila.tipoDependencia).trim()
                : "SIN ESPECIFICAR",
              nombreDependencia: fila.nombreDependencia
                ? String(fila.nombreDependencia).trim()
                : "SIN NOMBRE",
            },
            create: {
              tipoDependencia: fila.tipoDependencia
                ? String(fila.tipoDependencia).trim()
                : "SIN ESPECIFICAR",
              codigoTipoDependencia: String(fila.codigoTipoDependencia).trim(),
              nombreDependencia: fila.nombreDependencia
                ? String(fila.nombreDependencia).trim()
                : "SIN NOMBRE",
              codigoDependencia: String(fila.codigoDependencia).trim(),
            },
          });
          dependenciaId = dependencia.id;
        } catch (depError) {
          dependenciaId = null;
        }
      }

      // 2. Gestionar el Activo usando codBarras
      if (fila.codBarras && String(fila.codBarras).trim() !== "") {
        await prisma.activo.upsert({
          where: { codBarras: String(fila.codBarras).trim() },
          update: {
            placa: fila.placa ? String(fila.placa).trim() : null,
            descripcion: fila.descripcion || null,
            nombreInventario: fila.nombreInventario || null,
            fechaIngresoBien: fila.fechaIngresoBien || null,
            fechaEntrada: fila.fechaEntrada || null,
            fechaActivacion: fila.fechaActivacion || null,
            estadoUso: fila.estadoUso || null,
            marca: fila.marca || null,
            serial: fila.serial || null,
            estado: fila.estado || null,
            nombreTercero: fila.nombreTercero || null,
            terceroType: fila.terceroType || null,
            idDependencia: dependenciaId,
          },
          create: {
            codBarras: String(fila.codBarras).trim(),
            placa: fila.placa ? String(fila.placa).trim() : null,
            descripcion: fila.descripcion || null,
            nombreInventario: fila.nombreInventario || null,
            fechaIngresoBien: fila.fechaIngresoBien || null,
            fechaEntrada: fila.fechaEntrada || null,
            fechaActivacion: fila.fechaActivacion || null,
            estadoUso: fila.estadoUso || null,
            marca: fila.marca || null,
            serial: fila.serial || null,
            estado: fila.estado || null,
            nombreTercero: fila.nombreTercero || null,
            terceroType: fila.terceroType || null,
            idDependencia: dependenciaId,
          },
        });
      } else {
        await prisma.activo.create({
          data: {
            codBarras: fila.codBarras ? String(fila.codBarras).trim() : null,
            placa: fila.placa ? String(fila.placa).trim() : null,
            descripcion: fila.descripcion || null,
            nombreInventario: fila.nombreInventario || null,
            fechaIngresoBien: fila.fechaIngresoBien
              ? new Date(fila.fechaIngresoBien)
              : null,
            fechaEntrada: fila.fechaEntrada
              ? new Date(fila.fechaEntrada)
              : null,
            fechaActivacion: fila.fechaActivacion
              ? new Date(fila.fechaActivacion)
              : null,
            estadoUso: fila.estadoUso || null,
            marca: fila.marca || null,
            serial: fila.serial || null,
            estado: fila.estado || null,
            nombreTercero: fila.nombreTercero || null,
            terceroType: fila.terceroType || null,
            idDependencia: dependenciaId,
          },
        });
        // await prisma.activo.create({
        //   data: {
        //     placa: fila.placa ? String(fila.placa).trim() : null,
        //     codBarras: fila.codBarras ? String(fila.codBarras).trim() : null,
        //     descripcion: fila.descripcion || null,
        //     nombreInventario: fila.nombreInventario || null,
        //     fechaIngresoBien: fila.fechaIngresoBien || null,
        //     fechaEntrada: fila.fechaEntrada || null,
        //     fechaActivacion: fila.fechaActivacion || null,
        //     estadoUso: fila.estadoUso || null,
        //     marca: fila.marca || null,
        //     serial: fila.serial || null,
        //     estado: fila.estado || null,
        //     nombreTercero: fila.nombreTercero || null,
        //     terceroType: fila.terceroType || null,
        //     idDependencia: dependenciaId,
        //   },
        // });
      }

      insertadosOActualizados++;
    } catch (error) {
      erroresDb++;
      if (erroresDb === 1) {
        console.error("❌ ERROR REAL DE PRISMA EN FILA:", error.message);
      }
      detallesErrores.push({
        fila: fila.filaOriginal,
        placa: fila.placa || "N/A",
        codBarras: fila.codBarras || "N/A",
        error: error.message,
      });
    }
  }

  console.log(`[excel.importer] Importación finalizada.`);

  return {
    totalProcesados: filasValidas.length,
    insertadosOActualizados,
    erroresDb,
    detallesErrores,
  };
}

module.exports = { importarActivos };
// const { Pool } = require('pg');
// const { PrismaPg } = require('@prisma/adapter-pg');
// const { PrismaClient } = require('@prisma/client');

// // Configurar el pool de conexión con la base de datos de Neon y el adaptador
// const pool = new Pool({ connectionString: process.env.DATABASE_URL,
//     max : 5,
//     ssl: {
//         rejectUnauthorized: false // Esto es importante para Neon, ya que requiere SSL pero no verifica el certificado
//     }
//  });
// const adapter = new PrismaPg(pool);
// const prisma = new PrismaClient({ adapter });

// /**
//  * Importa los activos válidos a la base de datos de Neon usando Prisma.
//  * Gestiona automáticamente las dependencias y realiza operaciones seguras (upsert).
//  * @param {Array} filasValidas - Filas que pasaron exitosamente la validación.
//  * @returns {Object} Resumen detallado de la importación.
//  */
// async function importarActivos(filasValidas) {
//     console.log(`[excel.importer] Iniciando inserción de ${filasValidas.length} activos en la base de datos...`);

//     let insertadosOActualizados = 0;
//     let erroresDb = 0;
//     const detallesErrores = [];

//     // Tamaño del lote para optimizar transacciones y memoria
//     const TAMAÑO_LOTE = 50;
//     const totalLotes = Math.ceil(filasValidas.length / TAMAÑO_LOTE);

//     for (let i = 0; i < filasValidas.length; i += TAMAÑO_LOTE) {
//         const lote = filasValidas.slice(i, i + TAMAÑO_LOTE);
//         const numeroLote = Math.floor(i / TAMAÑO_LOTE) + 1;
//         console.log(`[excel.importer] Procesando lote ${numeroLote} de ${totalLotes} (${lote.length} registros)...`);

//         for (const fila of lote) {
//             try {
//                 let dependenciaId = null;

//                 // 1. Si la fila trae datos de dependencia válidos, asegurarnos de buscarla o crearlos de forma segura
//                 if (
//                     fila.codigoDependencia &&
//                     fila.codigoTipoDependencia &&
//                     String(fila.codigoDependencia).trim() !== '' &&
//                     String(fila.codigoTipoDependencia).trim() !== ''
//                 ) {
//                     try {
//                         const dependencia = await prisma.dependencia.upsert({
//                             where: {
//                                 codigoDependencia_codigoTipoDependencia: {
//                                     codigoDependencia: String(fila.codigoDependencia).trim(),
//                                     codigoTipoDependencia: String(fila.codigoTipoDependencia).trim()
//                                 }
//                             },
//                             update: {
//                                 tipoDependencia: fila.tipoDependencia ? String(fila.tipoDependencia).trim() : 'SIN ESPECIFICAR',
//                                 nombreDependencia: fila.nombreDependencia ? String(fila.nombreDependencia).trim() : 'SIN NOMBRE'
//                             },
//                             create: {
//                                 tipoDependencia: fila.tipoDependencia ? String(fila.tipoDependencia).trim() : 'SIN ESPECIFICAR',
//                                 codigoTipoDependencia: String(fila.codigoTipoDependencia).trim(),
//                                 nombreDependencia: fila.nombreDependencia ? String(fila.nombreDependencia).trim() : 'SIN NOMBRE',
//                                 codigoDependencia: String(fila.codigoDependencia).trim()
//                             }
//                         });
//                         dependenciaId = dependencia.id;
//                     } catch (depError) {
//                         dependenciaId = null;
//                     }
//                 }

//                 // 2. Gestionar el Activo (usando codBarras como llave única para upsert)
//                 if (fila.codBarras && String(fila.codBarras).trim() !== '') {
//                     await prisma.activo.upsert({
//                         where: { codBarras: String(fila.codBarras).trim() },
//                         update: {
//                             placa: fila.placa ? String(fila.placa).trim() : null,
//                             descripcion: fila.descripcion || null,
//                             nombreInventario: fila.nombreInventario || null,
//                             fechaIngresoBien: fila.fechaIngresoBien || null,
//                             fechaEntrada: fila.fechaEntrada || null,
//                             fechaActivacion: fila.fechaActivacion || null,
//                             estadoUso: fila.estadoUso || null,
//                             marca: fila.marca || null,
//                             serial: fila.serial || null,
//                             estado: fila.estado || null,
//                             nombreTercero: fila.nombreTercero || null,
//                             terceroType: fila.terceroType || null,
//                             idDependencia: dependenciaId
//                         },
//                         create: {
//                             codBarras: String(fila.codBarras).trim(),
//                             placa: fila.placa ? String(fila.placa).trim() : null,
//                             descripcion: fila.descripcion || null,
//                             nombreInventario: fila.nombreInventario || null,
//                             fechaIngresoBien: fila.fechaIngresoBien || null,
//                             fechaEntrada: fila.fechaEntrada || null,
//                             fechaActivacion: fila.fechaActivacion || null,
//                             estadoUso: fila.estadoUso || null,
//                             marca: fila.marca || null,
//                             serial: fila.serial || null,
//                             estado: fila.estado || null,
//                             nombreTercero: fila.nombreTercero || null,
//                             terceroType: fila.terceroType || null,
//                             idDependencia: dependenciaId
//                         }
//                     });
//                 } else {
//                     // Si el activo no cuenta con código de barras, se crea de forma independiente
//                     await prisma.activo.create({
//                         data: {
//                             placa: fila.placa ? String(fila.placa).trim() : null,
//                             codBarras: fila.codBarras ? String(fila.codBarras).trim() : null,
//                             descripcion: fila.descripcion || null,
//                             nombreInventario: fila.nombreInventario || null,
//                             fechaIngresoBien: fila.fechaIngresoBien || null,
//                             fechaEntrada: fila.fechaEntrada || null,
//                             fechaActivacion: fila.fechaActivacion || null,
//                             estadoUso: fila.estadoUso || null,
//                             marca: fila.marca || null,
//                             serial: fila.serial || null,
//                             estado: fila.estado || null,
//                             nombreTercero: fila.nombreTercero || null,
//                             terceroType: fila.terceroType || null,
//                             idDependencia: dependenciaId
//                         }
//                     });
//                 }

//                 insertadosOActualizados++;
//             } catch (error) {
//                 erroresDb++;
//                 if (erroresDb <= 1) {
//                     console.error(`error`, error);
//                 }
//                 detallesErrores.push({
//                     fila: fila.filaOriginal,
//                     placa: fila.placa || 'N/A',
//                     codBarras: fila.codBarras || 'N/A',
//                     error: error.message
//                 });
//             }
//         }
//     }

//     console.log(`[excel.importer] Importación finalizada.`);

//     return {
//         totalProcesados: filasValidas.length,
//         insertadosOActualizados,
//         erroresDb,
//         detallesErrores
//     };
// }

// module.exports = { importarActivos };
