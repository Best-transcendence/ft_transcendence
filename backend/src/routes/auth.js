export default async function authRoutes(fastify) {
  fastify.post("/auth/login", async (request, reply) => {
    console.log("Received body________:", request.body); // 👈 log to debug and check the variables

    const { email, password } = request.body;

    // check in DB
    const user = await fastify.prisma.user.findUnique({ where: { email } });
    if (!user || password !== "q") { // Simple check we need to set up a different password policy.
      return reply.status(401).send({ error: "Invalid credentials" });
    }

    return { id: user.id, email: user.email, name: user.name };
  });
}
