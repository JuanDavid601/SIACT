const fp = require('fastify-plugin');
const { PrismaClient } = require('../../generated/prisma');
const { PrismaPg } = require('@prisma/adapter-pg');

async function prismaPlugin(fastify) {

    const adapter = new PrismaPg({
        connectionString: process.env.DATABASE_URL
    });

    const prisma = new PrismaClient({
        adapter
    });

    await prisma.$connect();

    fastify.decorate('prisma', prisma);

    fastify.addHook('onClose', async () => {
        await prisma.$disconnect();
    });
}

module.exports = fp(prismaPlugin);