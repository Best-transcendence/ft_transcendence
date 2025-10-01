// User management routes for user service
export default async function (fastify, _opts) {

  // GET /users - Get all user profiles
  fastify.get('/', {
    // Everything in schema is public information only, for documentation purposes (Swagger).
    // We have to add it for each endpoint we create.
    schema: {
      tags: ['User Management'],
      summary: 'Get All User Profiles',
      description: 'Retrieve a list of all user profiles (public information only)',
      response: {
        200: {
          description: 'List of user profiles',
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
              email: { type: 'string' },
              profilePicture: { type: 'string' },
              bio: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' }
            }
          }
        }
      }
    }
  }, async (_req, _reply) => {
    return await fastify.prisma.userProfile.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        profilePicture: true,
        bio: true,
        createdAt: true
        // Don't expose authUserId, matchHistory, stats to public
      }
    });
  });

  // POST /users/bootstrap - Create or update user profile (called by auth-service)
  fastify.post('/bootstrap', {
    // Everything in schema is public information only, for documentation purposes (Swagger).
    // We have to add it for each endpoint we create.
    schema: {
      tags: ['User Management'],
      summary: 'Bootstrap User Profile',
      description: 'Create or update user profile (idempotent endpoint called by auth-service)',
      body: {
        type: 'object',
        required: ['authUserId', 'name', 'email'],
        properties: {
          authUserId: {
            type: 'integer',
            description: 'User ID from auth-service (must be unique)'
          },
          name: {
            type: 'string',
            minLength: 1,
            description: 'Username (duplicated from auth-service)'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email (duplicated from auth-service)'
          }
        }
      },
      response: {
        200: {
          description: 'User profile created or updated successfully',
          type: 'object',
          properties: {
            id: { type: 'integer' },
            authUserId: { type: 'integer' },
            name: { type: 'string' },
            email: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        201: {
          description: 'User profile created successfully',
          type: 'object',
          properties: {
            id: { type: 'integer' },
            authUserId: { type: 'integer' },
            name: { type: 'string' },
            email: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        400: {
          description: 'Bad request - validation error',
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        },
        500: {
          description: 'Internal server error',
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { authUserId, name, email } = request.body;
      const correlationId = request.headers['x-correlation-id'] || `user-${authUserId}-${Date.now()}`;

      // Input validation
      if (!authUserId || !name || !email) {
        console.error(`[${correlationId}] Bootstrap validation failed - missing required fields`);
        return reply.status(400).send({ error: 'authUserId, name, and email are required' });
      }

      // Email format validation (basic)
      if (!email.includes('@') || !email.includes('.')) {
        console.error(`[${correlationId}] Bootstrap validation failed - invalid email format: ${email}`);
        return reply.status(400).send({ error: 'Invalid email format' });
      }

	  // Name uniqueness check
	const existingNameUser = await fastify.prisma.userProfile.findFirst(
	{
		where:
		{
			name: name,
			NOT: { authUserId: authUserId } // Exclude current -> for name update
		}
	});

	// Check for existing users to prevent duplicates
	if (existingNameUser)
	{
		console.error(`[${correlationId}] Username '${name}' already taken`);
		return reply.status(400).send({ error: 'Username already taken' });
	}

      console.log(`[${correlationId}] Bootstrap request for authUserId: ${authUserId}, name: ${name}, email: ${email}`);

      // Check if user profile already exists
      const existingProfile = await fastify.prisma.userProfile.findUnique({
        where: { authUserId }
      });

      if (existingProfile) {
        // Update existing profile with latest data from auth-service
        console.log(`[${correlationId}] Updating existing profile for authUserId: ${authUserId}`);

        const updatedProfile = await fastify.prisma.userProfile.update({
          where: { authUserId },
          data: {
            name,
            email,
            updatedAt: new Date()
          }
        });

        console.log(`[${correlationId}] Successfully updated profile for authUserId: ${authUserId}`);
        return reply.status(200).send({
          id: updatedProfile.id,
          authUserId: updatedProfile.authUserId,
          name: updatedProfile.name,
          email: updatedProfile.email,
          createdAt: updatedProfile.createdAt,
          updatedAt: updatedProfile.updatedAt
        });
      } else {
        // Create new user profile
        console.log(`[${correlationId}] Creating new profile for authUserId: ${authUserId}`);

        const newProfile = await fastify.prisma.userProfile.create({
          data: {
            authUserId,
            name,
            email,
            matchHistory: {}, // Initialize as empty object
            stats: {}, // Initialize as empty object
			profilePicture: "/assets/default-avatar.jpeg", // Sets default profile pic
			bio: "Hi, I'm playing Arcade Clash"
		}
        });

        console.log(`[${correlationId}] Successfully created profile for authUserId: ${authUserId}`);
        return reply.status(201).send({
          id: newProfile.id,
          authUserId: newProfile.authUserId,
          name: newProfile.name,
          email: newProfile.email,
          createdAt: newProfile.createdAt,
          updatedAt: newProfile.updatedAt
        });
      }

    } catch (error) {
      const correlationId = request.headers['x-correlation-id'] || 'unknown';
      console.error(`[${correlationId}] Bootstrap error:`, {
        error: error.message,
        authUserId: request.body?.authUserId,
        stack: error.stack
      });

      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // GET /users/me - Get current user profile
  fastify.get('/me', {
    // Everything in schema is public information only, for documentation purposes (Swagger).
    // We have to add it for each endpoint we create.
    schema: {
      tags: ['User Management'],
      summary: 'Get Current User Profile',
      description: 'Get the authenticated user\'s complete profile information',
      security: [{ Bearer: [] }],
      response: {
        200: {
          description: 'Current user profile',
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                authUserId: { type: 'integer' },
                name: { type: 'string' },
                email: { type: 'string' },
                profilePicture: { type: 'string' },
                bio: { type: 'string' },
				friends:
				{
					select: { id: true },
					orderBy: { name: 'asc' }
				},
				friendOf:
				{
					select:
					{
						id: true,
						name: true,
						profilePicture: true,
						bio: true,
						//onlineStatus: true
					},
					orderBy: { name: 'asc' }
				},
                matchHistory: { type: 'object' },
                stats: { type: 'object' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
              }
            }
          }
        },
        401: {
          description: 'Unauthorized - invalid or missing token',
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      // Verify token (throws if invalid)
      await request.jwtVerify();

      // Find user profile by authUserId from JWT token
      const user = await fastify.prisma.userProfile.findUnique({
        where: { authUserId: request.user.id },
		include:
		{
			friends: { select: { id: true },},
			friendOf:
			{
				select: { id: true, name: true, profilePicture: true, bio: true },
				orderBy: { name: 'asc'}
			}
		}
      });

	if (user.friendOf) // sorts friends name alphabetically
		user.friendOf.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

      if (!user) {
        return reply.status(404).send({ error: 'User profile not found' });
      }

      return { user };
    } catch (_err) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
  });

  fastify.post('/me', {
    schema: {
      tags: ['User Management'],
      summary: 'Update Current User Profile',
      description: 'Update the authenticated user\'s profile information',
      security: [{ Bearer: [] }],
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          profilePicture: { type: 'string' },
		  action: { type: 'string', enum: ['add_friend', 'remove_friend'] },
   		  friendId: { type: 'integer' }
        }
      },
      response: {
        200: {
          description: 'Updated user profile',
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                authUserId: { type: 'integer' },
                name: { type: 'string' },
                email: { type: 'string' },
                profilePicture: { type: 'string' },
                bio: { type: 'string' },
                matchHistory: { type: 'object' },
                stats: { type: 'object' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
              }
            }
          }
        },
        400: {
          description: 'Bad request',
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        },
        401: {
          description: 'Unauthorized - invalid or missing token',
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      await request.jwtVerify();
      const userId = request.user.id;
      const { action, friendId, ...updateData } = request.body;

		if (action === 'add_friend')
		{
			await fastify.prisma.userProfile.update(
			{
				where: { authUserId: userId },
				data: { friends: { connect: { id: friendId } } }
			});
			return { message: `${ friendId } added to ${ userId }friendlist` };
		}

		if (action === 'remove_friend') //Remove from both lists to break link completely
		{
			await fastify.prisma.userProfile.update(
			{
				where: { authUserId: userId },
				data: { friends: { disconnect: { id: friendId } } }
			});

			await fastify.prisma.userProfile.update(
			{
				where: { id: friendId },
				data: { friends: { disconnect: { authUserId: userId } } }
			});

			return { message: `${ friendId } and ${ userId } are broken off` };
		}

		const updatedUser = await fastify.prisma.userProfile.update(
		{
			where: { authUserId: userId },
			data: updateData
		});

      return { user: updatedUser };
    } catch (err) {
      if (err.code === 'P2025') { // Prisma not found error
        return reply.status(404).send({ error: 'User profile not found' });
      }
	  if (err.code === 'P2002'){
		return reply.status(400).send({ error: 'Username already taken'});
	  }
      return reply.status(401).send({ error: 'Unauthorized or update failed' });
    }
  });
}

