export default async function authRoutes(fastify) {
  fastify.post("/auth/login", async (request, reply) => {
    try {
      console.log("Received body________:", request.body); // log to debug and check the variables

      const { email, password } = request.body;

      // Basic input validation
      if (!email || !password) {
        return reply.status(400).send({ error: "Email and password are required" });
      }

      // Email format validation (basic)
      if (!email.includes('@') || !email.includes('.')) {
        return reply.status(400).send({ error: "Please enter a valid email address" });
      }

      // Password length validation
      if (password.length < 1) {
        return reply.status(400).send({ error: "Password cannot be empty" });
      }

      // check in DB
      const user = await fastify.prisma.user.findUnique({ where: { email } });
      
      if (!user) {
        return reply.status(401).send({ error: "Invalid credentials" });
      }

      // Password validation
      if (password !== user.password) {
        return reply.status(401).send({ error: "Invalid credentials" });
      }

      return { id: user.id, email: user.email, name: user.name };
    } catch (error) {
      // Log the error for debugging
      fastify.log.error('Login error:', error);
      
      // Return generic error to client (don't expose internal details)
      return reply.status(500).send({ error: "Internal server error" });
    }
  });
}
