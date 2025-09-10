export default async function authRoutes(fastify) {
  fastify.post("/login", async (request, reply) => {
    try {
      console.log("Received body________:", request.body); // log to debug and check the variables

      const { email, password } = request.body;

      // Basic input validation
      console.log("Validation check - email:", email, "password:", password);
      console.log("!email:", !email, "!password:", !password);

      if (!email || !password) {
        console.log("Validation failed - returning 400");
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

      // Create a JWT with user ID inside________________________
      const token = fastify.jwt.sign({ id: user.id });

      return {
        token, // 👈 send token to frontend
        user: { id: user.id, name: user.name, email: user.email }
      };
      // return { id: user.id, email: user.email, name: user.name };
      // ________________________

    } catch (error) {
      // Log the error for debugging
      fastify.log.error('Login error:', error);

      // Return generic error to client (don't expose internal details)
      return reply.status(500).send({ error: "Internal server error" });
    }
  });
  //__________new code . create the /me path that is private to connect with the frontend.
  // we need to import fastify@jtw
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

  fastify.post("/signup", async (request, reply) => {
    try {
      console.log("Received signup body________:", request.body);

      const { name, email, password, confirmPassword } = request.body;

      // Basic input validation
      if (!name || !email || !password || !confirmPassword) {
        return reply.status(400).send({ error: "All fields are required" });
      }

      // Email format validation (basic)
      if (!email.includes('@') || !email.includes('.')) {
        return reply.status(400).send({ error: "Please enter a valid email address" });
      }

      // Password validation
      if (password.length < 1) {
        return reply.status(400).send({ error: "Password cannot be empty" });
      }

      // Password confirmation validation
      if (password !== confirmPassword) {
        return reply.status(400).send({ error: "Passwords do not match" });
      }

      // Check if user already exists
      const existingUser = await fastify.prisma.user.findFirst({ where: { name } });
      if (existingUser) {
        return reply.status(400).send({ error: "User with this name already exists" });
      }

      const existingEmail = await fastify.prisma.user.findUnique({ where: { email } });
      if (existingEmail) {
        return reply.status(400).send({ error: "User with this email already exists" });
      }

      // Create new user
      const newUser = await fastify.prisma.user.create({
        data: {
          name,
          email,
          password
        }
      });

      return { id: newUser.id, email: newUser.email, name: newUser.name };
    } catch (error) {
      // Log the error for debugging
      fastify.log.error('Signup error:', error);

      // Return generic error to client (don't expose internal details)
      return reply.status(500).send({ error: "Internal server error" });
    }
  });
}
