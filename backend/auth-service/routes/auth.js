// Authentication routes for user login and registration
export default async function authRoutes(fastify) {
  
  // POST /auth/login - Authenticate user and return JWT token
  fastify.post("/login", async (request, reply) => {
    try {
      console.log("Login attempt received:", request.body); // Debug log for login attempts

      const { email, password } = request.body;

      // Input validation - ensure required fields are present
      console.log("Validating credentials - email:", !!email, "password:", !!password);

      if (!email || !password) {
        console.log("Validation failed - missing required fields");
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

      // Look up user in database by email
      const user = await fastify.prisma.user.findUnique({ where: { email } });

      if (!user) {
        // Don't reveal if email exists - use generic error for security
        return reply.status(401).send({ error: "Invalid credentials" });
      }

      // TODO: Replace plain text password comparison with bcrypt hash comparison
      // Password validation (currently plain text - should be hashed)
      if (password !== user.password) {
        return reply.status(401).send({ error: "Invalid credentials" });
      }

      // Generate JWT token with user ID payload
      const token = fastify.jwt.sign({ id: user.id });

      // Return token and safe user data (no password)
      return {
        token, // JWT token for frontend authentication
        user: { id: user.id, name: user.name, email: user.email }
      };

    } catch (error) {
      // Log the error for debugging
      fastify.log.error('Login error:', error);

      // Return generic error to client (don't expose internal details)
      return reply.status(500).send({ error: "Internal server error" });
    }
  });
  // NOTE: /me endpoint moved to user-service as it handles user profile data

  // POST /auth/signup - Register new user account
  fastify.post("/signup", async (request, reply) => {
    try {
      console.log("User registration attempt:", request.body);

      const { name, email, password, confirmPassword } = request.body;

      // Input validation - ensure all required fields are present
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

      // Check for existing users to prevent duplicates
      const existingUser = await fastify.prisma.user.findFirst({ where: { name } });
      if (existingUser) {
        return reply.status(400).send({ error: "User with this name already exists" });
      }

      const existingEmail = await fastify.prisma.user.findUnique({ where: { email } });
      if (existingEmail) {
        return reply.status(400).send({ error: "User with this email already exists" });
      }

      // TODO: Hash password with bcrypt before storing
      // Create new user in database
      const newUser = await fastify.prisma.user.create({
        data: {
          name,
          email,
          password // TODO: Should be hashed password
        }
      });

      // Return user data without password for security
      return { id: newUser.id, email: newUser.email, name: newUser.name };
    } catch (error) {
      // Log the error for debugging
      fastify.log.error('Signup error:', error);

      // Return generic error to client (don't expose internal details)
      return reply.status(500).send({ error: "Internal server error" });
    }
  });
}
