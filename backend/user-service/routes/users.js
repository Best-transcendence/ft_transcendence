export default async function (fastify, opts) {
    fastify.get('/', async (req, reply) => {
        return await fastify.prisma.user.findMany();
    });

    // GET /me - Get current user profile (moved from auth-service)
    fastify.get("/me", async (request, reply) => {
        try {
            // Verify token (throws if invalid)
            await request.jwtVerify();

            // request.user = { id: ... }
            const user = await fastify.prisma.user.findUnique({
                where: { id: request.user.id }
            });

            return { user };
        } catch (err) {
            return reply.status(401).send({ error: "Unauthorized" });
        }
    });
}
