// Authentication routes for user login and registration
export default async function authRoutes(fastify) {
  
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

      // Return token and safe user data (no password)
      return {
        token, // JWT token for frontend authentication
        user: { id: user.id, name: user.name, email: user.email }
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
  fastify.post('/signup', {
    // Everything in schema is public information only, for documentation purposes (Swagger). 
    // We have to add it for each endpoint we create.
    schema: {
      tags: ['Authentication'],
      summary: 'User Registration',
      description: 'Register a new user account with email, username, and password',
      body: {
        type: 'object',
        required: ['name', 'email', 'password', 'confirmPassword'],
        properties: {
          name: { 
            type: 'string', 
            minLength: 1,
            description: 'Unique username for the account'
          },
          email: { 
            type: 'string', 
            format: 'email',
            description: 'User email address (must be unique)'
          },
          password: { 
            type: 'string', 
            minLength: 1,
            description: 'User password'
          },
          confirmPassword: { 
            type: 'string', 
            minLength: 1,
            description: 'Password confirmation (must match password)'
          }
        }
      },
      response: {
        200: {
          description: 'Successful registration',
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'johndoe' },
            email: { type: 'string', example: 'john@example.com' }
          }
        },
        400: {
          description: 'Bad request - validation error',
          type: 'object',
          properties: {
            error: { 
              type: 'string', 
              examples: [
                'All fields are required',
                'Please enter a valid email address',
                'Passwords do not match',
                'User with this name already exists',
                'User with this email already exists'
              ]
            }
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
      console.log('User registration attempt:', request.body);

      const { name, email, password, confirmPassword } = request.body;

      // Input validation - ensure all required fields are present
      if (!name || !email || !password || !confirmPassword) {
        return reply.status(400).send({ error: 'All fields are required' });
      }

      // Email format validation (basic)
      if (!email.includes('@') || !email.includes('.')) {
        return reply.status(400).send({ error: 'Please enter a valid email address' });
      }

      // Password validation
      if (password.length < 1) {
        return reply.status(400).send({ error: 'Password cannot be empty' });
      }

      // Password confirmation validation
      if (password !== confirmPassword) {
        return reply.status(400).send({ error: 'Passwords do not match' });
      }

      // Check for existing users to prevent duplicates
      const existingUser = await fastify.prisma.user.findFirst({ where: { name } });
      if (existingUser) {
        return reply.status(400).send({ error: 'User with this name already exists' });
      }

      const existingEmail = await fastify.prisma.user.findUnique({ where: { email } });
      if (existingEmail) {
        return reply.status(400).send({ error: 'User with this email already exists' });
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

      // Generate correlation ID for tracking across services
      const correlationId = `auth-${newUser.id}-${Date.now()}`;
      
      // Attempt to create user profile in user-service
      try {
        const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3002';
        const axios = (await import('axios')).default;
        
        console.log(`[${correlationId}] Attempting to bootstrap user profile for authUserId: ${newUser.id}`);
        
        // TODO: decide what we want to do if the profile creation fails in user-service.
        // Now we just continue with the signup success.
        await axios.post(`${userServiceUrl}/users/bootstrap`, {
          authUserId: newUser.id,
          name: newUser.name,
          email: newUser.email
        }, {
          timeout: 5000, // 5 second timeout
          headers: {
            'Content-Type': 'application/json',
            'X-Correlation-ID': correlationId
          }
        });

        console.log(`[${correlationId}] Successfully created user profile for authUserId: ${newUser.id}`);
      } catch (profileError) {
        // Log the error but don't fail the signup - user account is created
        console.error(`[${correlationId}] Failed to bootstrap user profile for authUserId: ${newUser.id}:`, {
          error: profileError.message,
          status: profileError.response?.status,
          data: profileError.response?.data
        });
        
        // Continue with successful response - user account is created in auth-service
        console.log(`[${correlationId}] Continuing with signup success despite profile creation failure`);
      }

      // Return user data without password for security
      return { id: newUser.id, email: newUser.email, name: newUser.name };
    } catch (error) {
      // Log the error for debugging
      fastify.log.error('Signup error:', error);

      // Return generic error to client (don't expose internal details)
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });
}
