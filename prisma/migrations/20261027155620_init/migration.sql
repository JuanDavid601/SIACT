-- CreateTable
CREATE TABLE "Roles" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "Roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "idRol" INTEGER NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "apellido" VARCHAR(150) NOT NULL,
    "correoElectronico" TEXT NOT NULL,
    "direccion" TEXT,
    "contrasena" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dependencia" (
    "id" SERIAL NOT NULL,
    "tipoDependencia" TEXT NOT NULL,
    "nombreDependencia" TEXT NOT NULL,
    "codigoDependencia" TEXT NOT NULL,

    CONSTRAINT "Dependencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activos" (
    "id" SERIAL NOT NULL,
    "idUsuario" INTEGER,
    "idDependencia" INTEGER,
    "descripcion" TEXT,
    "nombreInventario" VARCHAR(150),
    "fechaIngresoBien" TIMESTAMP(3),
    "fechaEntrega" TIMESTAMP(3),
    "fechaEntrada" TIMESTAMP(3),
    "fechaActivacion" TIMESTAMP(3),
    "responsableActual" VARCHAR(150),
    "fecha" TIMESTAMP(3),
    "codBarras" TEXT,
    "codQr" TEXT,
    "estadoUso" TEXT,
    "placa" TEXT,
    "marca" TEXT,
    "serial" TEXT,

    CONSTRAINT "Activos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Historial_Activos" (
    "id" SERIAL NOT NULL,
    "idActivo" INTEGER NOT NULL,
    "usuariosId" INTEGER NOT NULL,
    "tipoEvento" TEXT NOT NULL,
    "detalles" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Historial_Activos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mantenimientos" (
    "id" SERIAL NOT NULL,
    "idActivo" INTEGER NOT NULL,
    "tecnicoId" INTEGER NOT NULL,
    "tipoMantenimiento" TEXT NOT NULL,
    "descripcion" TEXT,
    "diagnostico" TEXT,
    "repuestosUtilizados" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mantenimientos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Retiros" (
    "id" SERIAL NOT NULL,
    "idActivo" INTEGER NOT NULL,
    "usuariosId" INTEGER NOT NULL,
    "numeroResolucion" TEXT,
    "motivo" TEXT NOT NULL,
    "fechaBaja" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Retiros_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correoElectronico_key" ON "Usuario"("correoElectronico");

-- CreateIndex
CREATE INDEX "Usuario_idRol_idx" ON "Usuario"("idRol");

-- CreateIndex
CREATE UNIQUE INDEX "Activos_codBarras_key" ON "Activos"("codBarras");

-- CreateIndex
CREATE UNIQUE INDEX "Activos_codQr_key" ON "Activos"("codQr");

-- CreateIndex
CREATE INDEX "Activos_idUsuario_idx" ON "Activos"("idUsuario");

-- CreateIndex
CREATE INDEX "Activos_idDependencia_idx" ON "Activos"("idDependencia");

-- CreateIndex
CREATE INDEX "Activos_estadoUso_idx" ON "Activos"("estadoUso");

-- CreateIndex
CREATE INDEX "Activos_marca_idx" ON "Activos"("marca");

-- CreateIndex
CREATE INDEX "Activos_serial_idx" ON "Activos"("serial");

-- CreateIndex
CREATE INDEX "Historial_Activos_idActivo_idx" ON "Historial_Activos"("idActivo");

-- CreateIndex
CREATE INDEX "Historial_Activos_usuariosId_idx" ON "Historial_Activos"("usuariosId");

-- CreateIndex
CREATE INDEX "Historial_Activos_createdAt_idx" ON "Historial_Activos"("createdAt");

-- CreateIndex
CREATE INDEX "Mantenimientos_idActivo_idx" ON "Mantenimientos"("idActivo");

-- CreateIndex
CREATE INDEX "Mantenimientos_tecnicoId_idx" ON "Mantenimientos"("tecnicoId");

-- CreateIndex
CREATE INDEX "Mantenimientos_createdAt_idx" ON "Mantenimientos"("createdAt");

-- CreateIndex
CREATE INDEX "Retiros_idActivo_idx" ON "Retiros"("idActivo");

-- CreateIndex
CREATE INDEX "Retiros_usuariosId_idx" ON "Retiros"("usuariosId");

-- CreateIndex
CREATE INDEX "Retiros_fechaBaja_idx" ON "Retiros"("fechaBaja");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_idRol_fkey" FOREIGN KEY ("idRol") REFERENCES "Roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activos" ADD CONSTRAINT "Activos_idDependencia_fkey" FOREIGN KEY ("idDependencia") REFERENCES "Dependencia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activos" ADD CONSTRAINT "Activos_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Historial_Activos" ADD CONSTRAINT "Historial_Activos_idActivo_fkey" FOREIGN KEY ("idActivo") REFERENCES "Activos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Historial_Activos" ADD CONSTRAINT "Historial_Activos_usuariosId_fkey" FOREIGN KEY ("usuariosId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mantenimientos" ADD CONSTRAINT "Mantenimientos_idActivo_fkey" FOREIGN KEY ("idActivo") REFERENCES "Activos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mantenimientos" ADD CONSTRAINT "Mantenimientos_tecnicoId_fkey" FOREIGN KEY ("tecnicoId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Retiros" ADD CONSTRAINT "Retiros_idActivo_fkey" FOREIGN KEY ("idActivo") REFERENCES "Activos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Retiros" ADD CONSTRAINT "Retiros_usuariosId_fkey" FOREIGN KEY ("usuariosId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
