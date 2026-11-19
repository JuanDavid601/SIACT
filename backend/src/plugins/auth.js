const fp = require("fastify-plugin");
const fastifyCookie = require("@fastify/cookie");
const fastifyJwt = require("@fastify/jwt");

async function authPlugin(fastify) {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET debe existir y tener al menos 32 caracteres");
  }

  await fastify.register(fastifyCookie);

  await fastify.register(fastifyJwt, {
    secret,
    cookie: { cookieName: "token", signed: false },
    sign: { expiresIn: "8h" },
  });

  // Autenticación: ¿hay un token válido en la cookie?
  fastify.decorate("authenticate", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply.code(401).send({ error: "No autenticado" });
    }
  });

  // Autorización: ¿el rol del usuario está permitido?
  fastify.decorate("authorizeRoles", (...rolesPermitidos) => {
    return async (request, reply) => {
      if (!rolesPermitidos.includes(request.user.rol)) {
        return reply
          .code(403)
          .send({ error: "No tienes permisos para esta acción" });
      }
    };
  });
}

module.exports = fp(authPlugin);
