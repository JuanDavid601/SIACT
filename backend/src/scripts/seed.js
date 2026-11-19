require("dotenv").config();
const { PrismaClient } = require("../../../generated/prisma");
const { PrismaPg } = require("@prisma/adapter-pg");
const { hashPassword } = require("../utils/password");

const ROLES = [
  { nombre: "SUPER_ADMINISTRADOR", descripcion: "Control total del sistema" },
  { nombre: "ADMINISTRADOR", descripcion: "Gestión operativa de activos" },
  { nombre: "USUARIO_NORMAL", descripcion: "Consulta de activos" },
];

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  try {
    const {
      SEED_ADMIN_EMAIL,
      SEED_ADMIN_PASSWORD,
      SEED_ADMIN_NOMBRE,
      SEED_ADMIN_APELLIDO,
    } = process.env;

    if (
      !SEED_ADMIN_EMAIL ||
      !SEED_ADMIN_PASSWORD ||
      !SEED_ADMIN_NOMBRE ||
      !SEED_ADMIN_APELLIDO
    ) {
      throw new Error("Faltan variables SEED_ADMIN_* en el .env");
    }
    if (SEED_ADMIN_PASSWORD.length < 10) {
      throw new Error(
        "La contraseña inicial debe tener al menos 10 caracteres",
      );
    }

    // 1. Roles: upsert = crear si no existe, no tocar nada si ya existe
    for (const rol of ROLES) {
      await prisma.rol.upsert({
        where: { nombre: rol.nombre },
        update: {},
        create: rol,
      });
    }
    console.log("Roles verificados");

    // 2. Superadmin: solo se crea si el correo no existe
    const existente = await prisma.usuario.findUnique({
      where: { correoElectronico: SEED_ADMIN_EMAIL },
    });

    if (existente) {
      console.log("El superadministrador ya existe, no se crea de nuevo");
      return;
    }

    const rolSuper = await prisma.rol.findUnique({
      where: { nombre: "SUPER_ADMINISTRADOR" },
    });

    await prisma.usuario.create({
      data: {
        idRol: rolSuper.id,
        nombre: SEED_ADMIN_NOMBRE,
        apellido: SEED_ADMIN_APELLIDO,
        correoElectronico: SEED_ADMIN_EMAIL,
        contrasena: await hashPassword(SEED_ADMIN_PASSWORD),
        estado: "ACTIVO",
      },
    });
    console.log("Superadministrador creado");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Error en el seed:", error.message);
  process.exit(1);
});
