// User management routes for user service

// Calculate user statistics from match history
async function calculateUserStats(prisma, userId) {
  // Get all matches where user participated
  const allMatches = await prisma.match.findMany({
    where: {
      OR: [
        { player1Id: userId },
        { player2Id: userId }
      ]
    }
  });

  const stats = {
    gamesPlayed: allMatches.length,
    wins: allMatches.filter(m => m.winnerId === userId).length,
    losses: allMatches.filter(m => m.winnerId && m.winnerId !== userId).length,
    draws: allMatches.filter(m => m.winnerId === null || m.winnerId === 0).length,
    pointsFor: 0,
    pointsAgainst: 0,
    highestScore: 0
  };

  // Calculate points
  allMatches.forEach(match => {
    const isPlayer1 = match.player1Id === userId;
    const playerScore = isPlayer1 ? match.player1Score : match.player2Score;
    const opponentScore = isPlayer1 ? match.player2Score : match.player1Score;
    
    stats.pointsFor += playerScore;
    stats.pointsAgainst += opponentScore;
    stats.highestScore = Math.max(stats.highestScore, playerScore);
  });

  // Ensure we always return explicit stats, even when no matches
  if (!stats) {
    return {
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      highestScore: 0
    };
  }
  
  return stats;
}

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

  fastify.get('/public/:authUserId', {
    schema: {
      tags: ['User Management'],
      summary: 'Public user lookup by auth user id',
      description: 'Returns a public profile subset for the given auth user id',

      // params must be a JSON-Schema object
      params: {
        type: 'object',
        properties: {
          authUserId: { type: 'integer' }
        },
        required: ['authUserId'],
        additionalProperties: false
      },

      response: {
        200: {
          type: 'object',
          properties: {
            authUserId: { type: 'integer' },
            name: { type: 'string' },
            profileId: { type: 'integer' },
            profilePicture: { type: 'string', nullable: true }
          }
        },
        404: {
          type: 'object',
          properties: { error: { type: 'string' } }
        }
      }
    }
  }, async (req, reply) => {
    const authUserId = Number(req.params.authUserId);
    if (!authUserId || Number.isNaN(authUserId)) {
      return reply.code(400).send({ error: 'Invalid authUserId' });
    }

    const user = await fastify.prisma.userProfile.findUnique({
      where: { authUserId },
      select: {
        authUserId: true,
        name: true,
        id: true,
        profilePicture: true
      }
    });

    if (!user) return reply.code(404).send({ error: 'Not found' });

    return {
      authUserId: user.authUserId,
      name: user.name,
      profileId: user.id,
      profilePicture: user.profilePicture
    };
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
            //matchHistory: {}, // Initialize as empty object
            //stats: {}, // Initialize as empty object
            profilePicture: '/assets/default-avatar.jpeg', // Sets default profile pic
            bio: 'Hi, I\'m playing Arcade Clash'
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
                friends: { select: { id: true }, },
                friendOf:
				{
				  select: { id: true, name: true, profilePicture: true, bio: true,},
				  orderBy: { name: 'asc' }
				},
                matches:
				{
				  type: 'array',
				  items:
					{
					  properties:
						{
						  id: { type: 'integer' },
						  type: { type: 'string' },
						  date: { type: 'string', format: 'date-time' },
						  player1Id: { type: 'integer' },
						  player2Id: { type: 'integer' },
						  player1Score: { type: 'integer' },
						  player2Score: { type: 'integer' },
						  winnerId: { type: 'integer' },
						  player1:
							{
							  type: 'object',
							  properties:
								{
								  id: { type: 'integer' },
								  name: { type: 'string' },
								  profilePicture: { type: 'string' }
								}
							},
						  player2:
							{
							  type: 'object',
							  properties:
								{
								  id: { type: 'integer' },
								  name: { type: 'string' },
								  profilePicture: { type: 'string' }
								}
							}
						}
					}
				},
                stats: {
                  type: 'object',
                  properties: {
                    gamesPlayed: { type: 'integer' },
                    wins: { type: 'integer' },
                    losses: { type: 'integer' },
                    draws: { type: 'integer' },
                    pointsFor: { type: 'integer' },
                    pointsAgainst: { type: 'integer' },
                    highestScore: { type: 'integer' }
                  },
                  additionalProperties: false
                },
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

      if (!user) {
        return reply.status(404).send({ error: 'User profile not found' });
      }

      if (user.friendOf) // sorts friends name alphabetically
        user.friendOf.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

      // Fetch all matches where user participated (without Prisma relations)
      const allMatches = await fastify.prisma.match.findMany({
        where: {
          OR: [
            { player1Id: user.id },
            { player2Id: user.id }
          ]
        },
        orderBy: { date: 'desc' }
      });

      // Fetch player details for each match
      const matchesWithPlayers = await Promise.all(
        allMatches.map(async (match) => {
          const player1 = match.player1Id 
            ? await fastify.prisma.userProfile.findUnique({
                where: { id: match.player1Id },
                select: { id: true, name: true, profilePicture: true }
              })
            : null;
          
          const player2 = match.player2Id
            ? await fastify.prisma.userProfile.findUnique({
                where: { id: match.player2Id },
                select: { id: true, name: true, profilePicture: true }
              })
            : null;

          return {
            ...match,
            player1,
            player2
          };
        })
      );

      user.matches = matchesWithPlayers;

      // Calculate stats on-the-fly
      console.log(`[${request.id}] About to calculate stats for user ${user.id}`);
      const stats = await calculateUserStats(fastify.prisma, user.id);
      console.log(`[${request.id}] Calculated stats:`, stats);
      console.log('DEBUG final stats before sending:', JSON.stringify(stats));
      
      // Create stats object manually to avoid any serialization issues
      const manualStats = {
        gamesPlayed: stats.gamesPlayed || 0,
        wins: stats.wins || 0,
        losses: stats.losses || 0,
        draws: stats.draws || 0,
        pointsFor: stats.pointsFor || 0,
        pointsAgainst: stats.pointsAgainst || 0,
        highestScore: stats.highestScore || 0
      };
      console.log(`[${request.id}] Manual stats:`, manualStats);
      
      // Create a clean user object without circular references
      const cleanUser = {
        id: user.id,
        authUserId: user.authUserId,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        profilePicture: user.profilePicture,
        bio: user.bio,
        friends: user.friends,
        friendOf: user.friendOf,
        matches: matchesWithPlayers,
        stats: manualStats
      };
      console.log(`[${request.id}] Final clean user stats:`, cleanUser.stats);

      // Create a completely clean stats object to avoid any serialization issues
      const cleanStats = {
        gamesPlayed: Number(manualStats.gamesPlayed) || 0,
        wins: Number(manualStats.wins) || 0,
        losses: Number(manualStats.losses) || 0,
        draws: Number(manualStats.draws) || 0,
        pointsFor: Number(manualStats.pointsFor) || 0,
        pointsAgainst: Number(manualStats.pointsAgainst) || 0,
        highestScore: Number(manualStats.highestScore) || 0
      };
      
      cleanUser.stats = cleanStats;
      console.log(`[${request.id}] Clean stats object:`, cleanStats);
      console.log(`[${request.id}] Final user with stats:`, JSON.stringify(cleanUser, null, 2));
      
      // Log the final response before sending
      console.log(`[${request.id}] Final response user stats:`, cleanUser.stats);
      console.log(`[${request.id}] Final response JSON:`, JSON.stringify({ user: cleanUser }, null, 2));
      
      return { user: cleanUser };
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
        properties:
		{
          	name: { type: 'string' },
          	profilePicture: { type: 'string' },
		  	action: { type: 'string', enum: ['add_friend', 'remove_friend', 'create_match'] },
   		 	friendId: { type: 'integer' },
		  	matchData:
		  	{
		  	  type: 'object',
		  	  properties:
				{
				  type: { type: 'string', enum: ['tournament', '1v1', 'AI'] },
				  player2Id: { type: 'integer' },
				  player1Score: { type: 'integer' },
				  player2Score: { type: 'integer' },
				  winnerId: { type: 'integer' },
				  date: { type: 'string', format: 'date-time' }
				}
		  	}
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
      const { action, friendId, matchData, ...updateData } = request.body;

      if (action === 'add_friend') //Add a friend
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

      if (action === 'create_match')
      {
        const { type, player2Id, player1Score, player2Score, _winnerId, date } = matchData;
        const currentUser = await fastify.prisma.userProfile.findUnique(
          {
            where: { authUserId: userId }
          });

        // retrieve date or create it
        let matchDate = new Date();
        if (date)
          matchDate = new Date(date);

        let finalWinnerId = null; // In case of draw
        if (player1Score > player2Score)
          finalWinnerId = currentUser.id;
        else if (player1Score < player2Score)
          finalWinnerId = player2Id;

        const match = await fastify.prisma.match.create(
          {
            data:
				{
				  type,
				  date: matchDate,
				  player1Id: currentUser.id,
				  player2Id,
				  player1Score,
				  player2Score,
				  winnerId: finalWinnerId
				}
          });
        return { message: 'Match created successfully', match };
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

