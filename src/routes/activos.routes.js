const { minLength } = require("zod");
const { Schema } = require("zod/v3");

async function activosRoutes(fastify) {
  fastify.get('/api/activos', async (request, reply) => {
    try {
      const activos = await fastify.prisma.activo.findMany();

      return {
        cantidad: activos.length,
        activos
      };
    } catch (error) {
      request.log.error(
        { err: error },
        'Error al consultar los activos'
      );

      return reply.code(500).send({
        mensaje: 'Error al obtener los activos',
        codigo: error.code ?? 'SIN_CODIGO',
        detalle: error.message
      });
    }
  });

//////////////////////////////////////
// Endpoint para crear un nuevo activo
//////////////////////////////////////

  fastify.post('/api/activos', {
      schema: {
        body: {
          type: 'object',
          required: ["codBarras", "placa"],
          additionalProperties: false,
          properties: {
            placa: { 
              type: 'string', 
              minLength: 1,
              maxLength: 100
            },
            codBarras: {
              type: 'string',
              minLength: 1,
              maxLength: 100
            },
            marca: {
              type: 'string',
            },
            serial: {
              type: 'string',
            },
            descripcion: {
              type: 'string',
            },
            nombreInventario: {
              type: 'string',
              maxLength: 150
            }

          }
        }
      }
  },
  
  async (request, reply) => {
    try {
      const { marca, serial, descripcion, nombreInventario, codBarras, placa } = request.body;

//Comprobaremos si ya existe un activo con el mismo código de barras o placa
      const activoExistente = await fastify.prisma.activo.findFirst({
        where: {
          OR: [ 
            { codBarras },
            { placa }
          ]
        }
      });

      if (activoExistente) {
        return reply.code(409).send({
          mensaje: 'Ya existe un activo con esa placa o código de barras'
        });
      }

      const nuevoActivo = await fastify.prisma.activo.create({
        data: {
          marca,
          serial,
          descripcion,
          nombreInventario,
          codBarras,
          placa,
        }
      });

      return reply.code(201).send(nuevoActivo);
    } catch (error) {
      request.log.error(
        { err: error },
        'Error al crear el activo'
      );

      if (error.code === 'P2002') {
        return reply.code(409).send({
          mensaje: 'Ya existe un activo con esa placa o código de barras',
        });
      }

      return reply.code(500).send({
        mensaje: 'Error interno al crear el activo',

      });
    }
  });

//////////////////////////////////////
// Endpoint para leer un activo por su codigo de barras
//////////////////////////////////////

  fastify.get('/api/activos/:codigo', async (request, reply) => {
    try {
        const { codigo } = request.params;

        const activo = fastify.prisma.activo.findUnique({
            where: {
                codBarras: codigo
            }
        });

        if (!activo) {
          return reply.code(404).status(404).send({
            error: "Activo no encontrado",
            message: "Codigo de activo no encontrado"
          });
        }

        return reply.code(200).send({
          exito: true,
          message: "Activo encontrado",
          resultado: activo        
        });

    }catch (error) {
      request.log.error(error);
        return reply.code(500).send({
          error: "Error interno del servidor",
          message: error.message
        });            
      }
    } 
)}

module.exports = activosRoutes
