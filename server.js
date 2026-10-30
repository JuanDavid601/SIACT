require('dotenv').config();
const fastify = require('fastify');
const fs = require('fs');
const path = require('path');
const prismaPlugin = require('./src/plugins/prisma');
const activosRoutes = require('./src/routes/activos.routes');

// Crear la carpeta logs si no existe
const logsDir = path.join(__dirname, 'logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Archivo donde se guardarán los logs
const logFile = path.join(logsDir, 'logs.log');

// Configuración de Fastify y Pino
const server = fastify({
  logger: {
    level: 'info',
    transport: {
      targets: [
        {
          target: 'pino-pretty',
          level: 'info',
          options: {
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname'
          }
        },
        {
          target: 'pino/file',
          level: 'info',
          options: {
            destination: logFile,
            mkdir: true
          }
        }
      ]
    }
  }
});

// Registrar el plugin de Prisma
server.register(prismaPlugin);
server.register(activosRoutes);

// Registrar las solicitudes recibidas
server.addHook('onRequest', async (request, reply) => {
  request.log.info({
    method: request.method,
    url: request.url
  }, 'Solicitud recibida');
});

// Ruta principal de prueba
server.get('/', async (request, reply) => {
  return {
    mensaje: 'SIACT - Backend funcionando',
    estado: 'OK'
  };
});




// Iniciar servidor
const iniciarServidor = async () => {
  try {
    await server.listen({
      port: 3000,
      host: '127.0.0.1'
    });

    server.log.info(
      'SIACT está corriendo en http://127.0.0.1:3000'
    );
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
};

iniciarServidor();
