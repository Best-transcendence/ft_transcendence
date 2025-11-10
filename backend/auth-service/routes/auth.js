// Authentication routes for user login and registration
import { createLogger, ErrorType } from '../utils/logger.js';

export default async function authRoutes(fastify) {
  // Create structured logger instance
  const logger = createLogger(fastify.log);

  // POST /auth/login - Authenticate user and return JWT token
  fastify.post('/login', {
    // Everything in schema is public information only, for documentation purposes (Swagger).
    // We have to add it for each endpoint we create.
    schema: {
      tags: ['Authentication'],
      summary: 'User Login',
      description: 'Authenticate user with email and password, returns JWT token',
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address'
          },
          password: {
            type: 'string',
            minLength: 1,
            description: 'User password'
          }
        }
      },
      response: {
        200: {
          description: 'Successful login',
          type: 'object',
          properties: {
            token: {
              type: 'string',
              description: 'JWT authentication token',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            },
            user: {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 1 },
                name: { type: 'string', example: 'John Doe' },
                email: { type: 'string', example: 'user@example.com' }
              }
            }
          }
        },
        400: {
          description: 'Bad request - missing or invalid input',
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Bad Request' }
          }
        },
        401: {
          description: 'Unauthorized - invalid credentials',
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Invalid credentials' }
          }
        },
        500: {
          description: 'Internal server error',
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Internal server error' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      console.log('Login attempt received:', request.body); // Debug log for login attempts

      const { email, password } = request.body;

      // Input validation - ensure required fields are present
      console.log('Validating credentials - email:', !!email, 'password:', !!password);

      if (!email || !password) {
        console.log('Validation failed - missing required fields');
        return reply.status(400).send({ error: 'Email and password are required' });
      }

      // Email format validation (basic)
      if (!email.includes('@') || !email.includes('.')) {
        return reply.status(400).send({ error: 'Please enter a valid email address' });
      }

      // Password length validation
      if (password.length < 1) {
        return reply.status(400).send({ error: 'Password cannot be empty' });
      }

      // Look up user in database by email
      const user = await fastify.prisma.user.findUnique({ where: { email } });

      if (!user) {
        // Don't reveal if email exists - use generic error for security
        return reply.status(401).send({ error: 'Invalid credentials' });
      }

      // TODO: Replace plain text password comparison with bcrypt hash comparison
      // Password validation (currently plain text - should be hashed)
      if (password !== user.password) {
        return reply.status(401).send({ error: 'Invalid credentials' });
      }

      // Generate JWT token with user ID payload
      const token = fastify.jwt.sign({ id: user.id });

      // === Bootstrap/verify profile in user-service (ensure profile exists) ===
      const correlationId = `login-${user.id}-${Date.now()}`;
      const axios = (await import('axios')).default;
      const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3002';

      try {
        console.log(`[${correlationId}] Bootstrapping/verifying user profile for authUserId ${user.id}`);

        // Try to get the user profile first
        const profileCheckResponse = await axios.get(
          `${userServiceUrl}/users/public/${user.id}`,
          {
            timeout: 3000,
            validateStatus: (status) => status < 500 // Accept 404 as valid response
          }
        );

        // If profile doesn't exist (404), create it
        if (profileCheckResponse.status === 404) {
          console.log(`[${correlationId}] Profile not found, creating new profile`);

          // Extract username from email as fallback (will be user-editable)
          const defaultName = user.email.split('@')[0];

          await axios.post(
            `${userServiceUrl}/users/bootstrap`,
            {
              authUserId: user.id,
              name: defaultName,
              email: user.email
            },
            {
              timeout: 5000,
              headers: {
                'Content-Type': 'application/json',
                'X-Correlation-ID': correlationId
              }
            }
          );
          console.log(`[${correlationId}] Successfully created user profile on login`);
        } else {
          console.log(`[${correlationId}] Profile already exists, continuing with login`);
        }
      } catch (profileError) {
        // Log error but don't fail login - user can still access the app
        // Frontend will handle missing profile gracefully with our fix
        console.error(
          `[${correlationId}] Failed to bootstrap profile (non-fatal): ${profileError.message}`
        );
      }

      // Return token and safe user data (no password)
      return {
        token, // JWT token for frontend authentication
        user: { id: user.id, email: user.email }
      };

    } catch (error) {
      // Log the error for debugging
      fastify.log.error('Login error:', error);

      // Return generic error to client (don't expose internal details)
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });
  // NOTE: /me endpoint moved to user-service as it handles user profile data

  // POST /auth/signup - Register new user account
  // Everything in schema is public information only, for documentation purposes (Swagger).
  // We have to add it for each endpoint we create.
  // POST /auth/signup - Register new user account
  fastify.post('/signup', {
    schema: {
      tags: ['Authentication'],
      summary: 'User Registration',
      description: 'Register a new user account with email, username, and password',
      body: {
        type: 'object',
        required: ['name', 'email', 'password', 'confirmPassword'],
        properties: {
          name: { type: 'string', minLength: 1 },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 1 },
          confirmPassword: { type: 'string', minLength: 1 }
        }
      },
      response: {
        200: {
          description: 'Successful registration',
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            email: { type: 'string', example: 'john@example.com' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      console.log('User registration attempt:', request.body);

      const { name, email, password, confirmPassword } = request.body;

      // === Input validation ===
      if (!name || !email || !password || !confirmPassword) {
        return reply.status(400).send({ error: 'All fields are required' });
      }

      // Normalize and validate lowercase only
      const normalizedEmail = email.toLowerCase();

      // Normalize to avoid e.g.: É Á...
      const nName  = name.normalize('NFC');
      const nEmail = email.normalize('NFC');

      if (nName !== nName.toLowerCase()) {
        return reply.status(400).send({ error: 'Username cannot contain capital letters' });
      }

      if (nEmail !== nEmail.toLowerCase()) {
        return reply.status(400).send({ error: 'Email cannot contain capital letters' });
      }

      // Space checks
      if (/\s/.test(name)) {
        return reply.status(400).send({ error: 'Username cannot contain spaces' });
      }

      if (/\s/.test(email)) {
        return reply.status(400).send({ error: 'Email cannot contain spaces' });
      }

      // validation for email and username characters
	  const allowedChars = /^[a-z0-9_.-]+$/;
	  const allowedEmailChars = /^[a-z0-9_.@-]+$/;

      if (!email.includes('@') || !email.includes('.')) {
        return reply.status(400).send({ error: 'Please enter a valid email address' });
      }

      if (!allowedChars.test(name)) {
        return reply.status(400).send({
          error: 'Username cannot contain special characters - only letters, numbers, _, - and .'
        });
      }

	  if (!allowedEmailChars.test(email)) {
        return reply.status(400).send({
          error: 'Email cannot contain special characters - only letters, numbers, _, -, @ and .'
        });
      }

      if (normalizedEmail.length < 3 || password.length < 1) {
        return reply.status(400).send({ error: 'Password cannot be empty' });
      }

      if (password !== confirmPassword) {
        return reply.status(400).send({ error: 'Passwords do not match' });
      }

      const existingEmail = await fastify.prisma.user.findUnique({
        where: { email: normalizedEmail }
      });
      if (existingEmail) {
        const correlationId = request.headers['x-correlation-id'] || `auth-${Date.now()}`;
        logger.error(correlationId, `User with email '${normalizedEmail}' already exists`, {
          errorType: ErrorType.DUPLICATE_EMAIL,
          errorCode: 'EMAIL_ALREADY_EXISTS',
          httpStatus: 400,
          metadata: { email: normalizedEmail }
        });
        return reply.status(400).send({ error: 'User with this email already exists' });
      }

      // === Create user in auth-service ===
      const newUser = await fastify.prisma.user.create({
        data: {
          email: normalizedEmail,
          password // TODO: hash before storing
        }
      });

      // === Bootstrap profile in user-service with retry ===
      const correlationId = `auth-${newUser.id}-${Date.now()}`;
      const axios = (await import('axios')).default;
      const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3002';

      const maxRetries = 3;
      let attempt = 0;
      let success = false;

      while (attempt < maxRetries && !success) {
        try {
          attempt++;
          console.log(
            `[${correlationId}] Attempt ${attempt}/${maxRetries}: bootstrapping user profile for authUserId ${newUser.id}`
          );

          await axios.post(
            `${userServiceUrl}/users/bootstrap`,
            {
              authUserId: newUser.id,
              name,
              email: newUser.email
            },
            {
              timeout: 5000,
              headers: {
                'Content-Type': 'application/json',
                'X-Correlation-ID': correlationId
              }
            }
          );

          console.log(`[${correlationId}] Successfully created user profile`);
          success = true;
        } catch (profileError) {
          const status = profileError.response?.status;
          const msg = profileError.response?.data?.error || profileError.message;

          console.error(
            `[${correlationId}] Attempt ${attempt} failed (${status || 'no status'}): ${msg}`
          );

          // unrecoverable client-side error (e.g., username conflict)
          if (status === 400) {
            await fastify.prisma.user.delete({ where: { id: newUser.id } });
            return reply
              .status(400)
              .send({ error: msg || 'Username already taken in user-service' });
          }

          // last retry failed → rollback and report error
          if (attempt >= maxRetries) {
            await fastify.prisma.user.delete({ where: { id: newUser.id } });
            console.error(
              `[${correlationId}] All ${maxRetries} attempts failed, rolled back user ${newUser.id}`
            );
            return reply.status(500).send({
              error:
                'Failed to create user profile after multiple attempts. Please try again later.'
            });
          }

          // brief delay before next retry
          await new Promise((r) => setTimeout(r, 200));
        }
      }

      // === Return success ===
      if (success) {
        return { id: newUser.id, email: newUser.email };
      }

    } catch (error) {
      fastify.log.error('Signup error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

}

