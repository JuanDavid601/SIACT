const fastify = require('fastify');
const pino = require('pino');
const fs = require('fs');
const path = require('path');


// Crear la carpeta logs si no existe
const logsDir = path.join(__dirname, 'logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Archivo donde se guardarán los logs
const logFile = path.join(logsDir, 'logs.log');

// Logger para archivo
const fileDestination = pino.destination({
  dest: logFile,
  sync: false
});

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


server.addHook('onRequest', async (request, reply) => {
  request.log.info({
    method: request.method,
    url: request.url
  }, 'Solicitud recibida');
});


server.get('/', async (request, reply) => {
  return {
    mensaje: 'SIACT - Backend funcionando',
    estado: 'OK'
  };
});


const iniciarServidor = async () => {
  try {
    await server.listen({
      port: 3000,
      host: '127.0.0.1'
    });

    server.log.info('SIACT está corriendo en http://127.0.0.1:3000');
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
};

iniciarServidor();