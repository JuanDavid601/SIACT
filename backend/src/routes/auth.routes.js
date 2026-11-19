const { z } = require("zod");
const {
  validarCredenciales,
  CredencialesInvalidas,
} = require("../services/auth.service");

const loginSchema = z.object({
  correo: z.email(),
  contrasena: z.string().min(1),
});

const COOKIE_OPCIONES = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};

async function authRoutes(fastify) {
  // LOGIN
  fastify.post("/login", async (request, reply) => {
    const datos = loginSchema.safeParse(request.body);
    if (!datos.success) {
      return reply
        .code(400)
        .send({ error: "Datos de inicio de sesión inválidos" });
    }

    try {
      const usuario = await validarCredenciales(
        fastify.prisma,
        datos.data.correo,
        datos.data.contrasena,
      );

      const token = await reply.jwtSign({ id: usuario.id, rol: usuario.rol });

      reply.setCookie("token", token, {
        ...COOKIE_OPCIONES,
        maxAge: 8 * 60 * 60,
      });

      return { usuario };
    } catch (error) {
      if (error instanceof CredencialesInvalidas) {
        return reply.code(401).send({ error: error.message });
      }
      throw error;
    }
  });

  // ¿QUIÉN SOY?
  fastify.get(
    "/me",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const usuario = await fastify.prisma.usuario.findUnique({
        where: { id: request.user.id },
        include: { rol: true },
      });

      if (!usuario || usuario.estado !== "ACTIVO") {
        reply.clearCookie("token", { path: "/" });
        return reply.code(401).send({ error: "Sesión no válida" });
      }

      return {
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          correoElectronico: usuario.correoElectronico,
          rol: usuario.rol.nombre,
        },
      };
    },
  );

  // LOGOUT
  fastify.post("/logout", async (request, reply) => {
    reply.clearCookie("token", { path: "/" });
    return { mensaje: "Sesión cerrada" };
  });
}

module.exports = authRoutes;
