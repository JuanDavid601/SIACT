/*
  Warnings:

  - A unique constraint covering the columns `[nombre]` on the table `Roles` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Roles_nombre_key" ON "Roles"("nombre");
