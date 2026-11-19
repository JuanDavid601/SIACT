const { z } = require("zod");
const { hashPassword } = require("../utils/password");

const crearUsuarioSchema = z.object({
  nombre: z.string().trim().min(1).max(150),
  apellido: z.string().trim().min(1).max(150),
  correo: z.email().transform((v) => v.trim().toLowerCase()),
  contrasena: z.string().min(10),
  rol: z.enum(["SUPER_ADMINISTRADOR", "ADMINISTRADOR", "USUARIO_NORMAL"]),
  direccion: z.string().trim().optional(),
});

async function usuariosRoutes(fastify) {
  fastify.post(
    "/",
    {
      preHandler: [
        fastify.authenticate,
        fastify.authorizeRoles("SUPER_ADMINISTRADOR"),
      ],
    },
    async (request, reply) => {
      const datos = crearUsuarioSchema.safeParse(request.body);
      if (!datos.success) {
        return reply.code(400).send({ error: "Datos de usuario inválidos" });
      }
      const { nombre, apellido, correo, contrasena, rol, direccion } =
        datos.data;

      const existente = await fastify.prisma.usuario.findUnique({
        where: { correoElectronico: correo },
      });
      if (existente) {
        return reply
          .code(409)
          .send({ error: "Ya existe un usuario con ese correo" });
      }

      const rolDb = await fastify.prisma.rol.findUnique({
        where: { nombre: rol },
      });
      if (!rolDb) {
        return reply.code(400).send({ error: "El rol no existe" });
      }

      const nuevo = await fastify.prisma.usuario.create({
        data: {
          idRol: rolDb.id,
          nombre,
          apellido,
          correoElectronico: correo,
          direccion,
          contrasena: await hashPassword(contrasena),
          estado: "ACTIVO",
        },
        select: {
          id: true,
          nombre: true,
          apellido: true,
          correoElectronico: true,
          estado: true,
        },
      });

      return reply.code(201).send({ usuario: { ...nuevo, rol } });
    },
  );
}

module.exports = usuariosRoutes;
