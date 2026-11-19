const { verifyPassword } = require("../utils/password");

// Hash falso con formato válido de bcrypt (costo 12). Se usa cuando el correo
// no existe, para que el tiempo de respuesta sea parecido en ambos casos.
const HASH_FALSO =
  "$2b$12$C6UzMDM.H6dfI/f/IKcEeO5Q0lT9n7mQe8rYQ1Wq1l5y4y3Zr3m6a";

class CredencialesInvalidas extends Error {
  constructor() {
    super("Correo o contraseña incorrectos");
    this.name = "CredencialesInvalidas";
  }
}

async function validarCredenciales(prisma, correo, contrasena) {
  const usuario = await prisma.usuario.findUnique({
    where: { correoElectronico: correo.toLowerCase().trim() },
    include: { rol: true },
  });

  const hash = usuario ? usuario.contrasena : HASH_FALSO;
  const coincide = await verifyPassword(contrasena, hash);

  if (!usuario || !coincide || usuario.estado !== "ACTIVO") {
    throw new CredencialesInvalidas();
  }

  return {
    id: usuario.id,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    correoElectronico: usuario.correoElectronico,
    rol: usuario.rol.nombre,
  };
}

module.exports = { validarCredenciales, CredencialesInvalidas };
