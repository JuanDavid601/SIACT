const fastify = require('fastify');

const server = fastify({
    logger: true,
});

// Register routes
server.get('/', async (request, reply) => {
  return { message: 'Siact Funcionando!' };
});

server.listen({ port: 3000 }, function (err) {
  if (err) {
    console.error(err);
    process.exit(1);
  };

  console.log('Fastify esta corriendo en: http://localhost:3000');
});