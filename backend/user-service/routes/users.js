// User management routes for user service

// Calculate user statistics from match history
function calculateUserStats(db, userId) {
  console.log(`[calculateUserStats] Starting calculation for userId: ${userId}`);
  
  const getMatchesStmt = db.prepare('SELECT * FROM Match WHERE player1Id = ? OR player2Id = ?');
  const allMatches = getMatchesStmt.all(userId, userId);

  console.log(`[calculateUserStats] Found ${allMatches.length} matches for user ${userId}`);
  console.log('[calculateUserStats] Raw matches:', JSON.stringify(allMatches, null, 2));

  if (!allMatches || allMatches.length === 0) {
    console.log('[calculateUserStats] No matches found, returning default values');
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

  const stats = {
    gamesPlayed: allMatches.length,
    wins: 0,
    losses: 0,
    draws: 0,
    pointsFor: 0,
    pointsAgainst: 0,
    highestScore: 0
  };

  console.log('[calculateUserStats] Initial stats:', JSON.stringify(stats));

  for (const match of allMatches) {
    const isPlayer1 = match.player1Id === userId;
    
    // Convert BigInt to Number if needed
    const playerScore = Number(isPlayer1 ? match.player1Score : match.player2Score);
    const opponentScore = Number(isPlayer1 ? match.player2Score : match.player1Score);

    console.log(`[calculateUserStats] Match ${match.id}: playerScore=${playerScore}, opponentScore=${opponentScore}, winnerId=${match.winnerId}, isPlayer1=${isPlayer1}`);

    stats.pointsFor += playerScore;
    stats.pointsAgainst += opponentScore;
    stats.highestScore = Math.max(stats.highestScore, playerScore);

    if (match.winnerId === userId) {
      stats.wins++;
      console.log(`[calculateUserStats] Match ${match.id}: WIN`);
    } else if (match.winnerId === null || match.winnerId === 0) {
      stats.draws++;
      console.log(`[calculateUserStats] Match ${match.id}: DRAW`);
    } else if (match.winnerId) {
      stats.losses++;
      console.log(`[calculateUserStats] Match ${match.id}: LOSS`);
    }
  }

  console.log('[calculateUserStats] Final calculated stats:', JSON.stringify(stats));
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
    const getProfilesStmt = fastify.db.prepare(
      'SELECT id, name, email, profilePicture, bio, createdAt FROM UserProfile'
    );
    return getProfilesStmt.all();
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

    const getUserStmt = fastify.db.prepare(
      'SELECT id, authUserId, name, profilePicture FROM UserProfile WHERE authUserId = ?'
    );
    const user = getUserStmt.get(authUserId);

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
      const checkNameStmt = fastify.db.prepare(
        'SELECT * FROM UserProfile WHERE name = ? AND authUserId != ?'
      );
      const existingNameUser = checkNameStmt.get(name, authUserId);

      // Check for existing users to prevent duplicates
      if (existingNameUser)
      {
        console.error(`[${correlationId}] Username '${name}' already taken`);
        return reply.status(400).send({ error: 'Username already taken' });
      }

      console.log(`[${correlationId}] Bootstrap request for authUserId: ${authUserId}, name: ${name}, email: ${email}`);

      // Check if user profile already exists
      const getExistingStmt = fastify.db.prepare('SELECT * FROM UserProfile WHERE authUserId = ?');
      const existingProfile = getExistingStmt.get(authUserId);

      if (existingProfile) {
        // Update existing profile with latest data from auth-service
        console.log(`[${correlationId}] Updating existing profile for authUserId: ${authUserId}`);

        const updateProfileStmt = fastify.db.prepare(
          'UPDATE UserProfile SET name = ?, email = ?, updatedAt = datetime("now") WHERE authUserId = ?'
        );
        updateProfileStmt.run(name, email, authUserId);

        // Get updated profile
        const updatedProfile = getExistingStmt.get(authUserId);

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

        const insertProfileStmt = fastify.db.prepare(
          'INSERT INTO UserProfile (authUserId, name, email, profilePicture, bio) VALUES (?, ?, ?, ?, ?)'
        );
        const result = insertProfileStmt.run(
          authUserId,
          name,
          email,
          '/assets/default-avatar.jpeg',
          'Hi, I\'m playing Arcade Clash'
        );

        // Get created profile
        const getNewProfileStmt = fastify.db.prepare('SELECT * FROM UserProfile WHERE id = ?');
        const newProfile = getNewProfileStmt.get(Number(result.lastInsertRowid));

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
                  additionalProperties: true, // ✅  allow all keys and keep numbers even if types mismatch slightly
                  properties: {
                    gamesPlayed: { type: ['integer', 'number', 'null'] },
                    wins: { type: ['integer', 'number', 'null'] },
                    losses: { type: ['integer', 'number', 'null'] },
                    draws: { type: ['integer', 'number', 'null'] },
                    pointsFor: { type: ['integer', 'number', 'null'] },
                    pointsAgainst: { type: ['integer', 'number', 'null'] },
                    highestScore: { type: ['integer', 'number', 'null'] }
                  },
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
      const getUserStmt = fastify.db.prepare('SELECT * FROM UserProfile WHERE authUserId = ?');
      const user = getUserStmt.get(request.user.id);

      if (!user) {
        return reply.status(404).send({ error: 'User profile not found' });
      }

      // Get friends (users who have this user in their friends list)
      const getFriendsStmt = fastify.db.prepare(`
        SELECT up.id, up.name, up.profilePicture, up.bio 
        FROM _UserFriends uf_rel
        JOIN UserProfile up ON uf_rel.friendId = up.id
        WHERE uf_rel.userProfileId = ?
        ORDER BY up.name ASC
      `);
      const friendOf = getFriendsStmt.all(user.id);

      // Get friends list (users this user has in their friends list) - just IDs
      const getFriendsIdsStmt = fastify.db.prepare(`
        SELECT friendId as id FROM _UserFriends WHERE userProfileId = ?
      `);
      const friends = getFriendsIdsStmt.all(user.id);

      // Sort friends alphabetically
      friendOf.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

      // Fetch all matches where user participated
      const getMatchesStmt = fastify.db.prepare(`
        SELECT * FROM Match 
        WHERE player1Id = ? OR player2Id = ?
        ORDER BY date DESC
      `);
      const allMatches = getMatchesStmt.all(user.id, user.id);

      // Fetch player details for each match
      const getPlayerStmt = fastify.db.prepare('SELECT id, name, profilePicture FROM UserProfile WHERE id = ?');
      const matchesWithPlayers = allMatches.map((match) => {
        const player1 = match.player1Id ? getPlayerStmt.get(match.player1Id) : null;
        const player2 = match.player2Id ? getPlayerStmt.get(match.player2Id) : null;

        return {
          ...match,
          player1,
          player2
        };
      });

      // Calculate stats on-the-fly
      console.log(`[${request.id}] About to calculate stats for user ${user.id}`);
      const stats = calculateUserStats(fastify.db, user.id);
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
        friends: friends,
        friendOf: friendOf,
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
      console.log('🟣 FINAL STATS CHECK:', stats);
      console.log(`[${request.id}] DEBUG: calculateUserStats result before sending:`, JSON.stringify(manualStats));

      // Clean up any non-serializable types (like BigInt, Decimal, etc.)
      const safeUser = JSON.parse(JSON.stringify(cleanUser));

      // Debug log before sending
      console.log(`[${request.id}] 🧩 Safe user before sending:`, safeUser.stats);
      console.log(`[${request.id}] 🧩 Final response JSON:`, JSON.stringify({ user: safeUser }, null, 2));

      return { user: safeUser };

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
				  type: { type: 'string', enum: ['ONE_VS_ONE', 'TOURNAMENT_1V1', 'TOURNAMENT_INTERMEDIATE', 'TOURNAMENT_FINAL'] },
				  player1Id: { type: 'integer' },
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
          description: 'Updated user profile or match created',
          type: 'object',
          properties: {
            message: { type: 'string' },
            match: { type: 'object' },
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

      console.log(`[${request.id}] POST /users/me - userId: ${userId}, action: ${action}, updateData:`, JSON.stringify(updateData));

      if (action === 'add_friend') //Add a friend
      {
        // Get user profile ID
        const getUserStmt = fastify.db.prepare('SELECT id FROM UserProfile WHERE authUserId = ?');
        const userProfile = getUserStmt.get(userId);
        if (!userProfile) {
          return reply.status(404).send({ error: 'User profile not found' });
        }

        // Insert friend relationship
        const insertFriendStmt = fastify.db.prepare(
          'INSERT OR IGNORE INTO _UserFriends (userProfileId, friendId) VALUES (?, ?)'
        );
        insertFriendStmt.run(userProfile.id, friendId);
        
        return { message: `${ friendId } added to ${ userId } friendlist` };
      }

      if (action === 'remove_friend') //Remove from both lists to break link completely
      {
        // Get user profile ID
        const getUserStmt = fastify.db.prepare('SELECT id FROM UserProfile WHERE authUserId = ?');
        const userProfile = getUserStmt.get(userId);
        if (!userProfile) {
          return reply.status(404).send({ error: 'User profile not found' });
        }

        // Remove friend relationship (both directions)
        const deleteFriendStmt = fastify.db.prepare(
          'DELETE FROM _UserFriends WHERE userProfileId = ? AND friendId = ?'
        );
        deleteFriendStmt.run(userProfile.id, friendId);
        deleteFriendStmt.run(friendId, userProfile.id);

        return { message: `${ friendId } and ${ userId } are broken off` };
      }

      if (action === 'create_match')
      {
        console.log(`[${request.id}] Creating match with data:`, matchData);
        const { type, player1Id, player2Id, player1Score, player2Score, _winnerId, date } = matchData;
        
        // Get both player profiles
        const getPlayer1Stmt = fastify.db.prepare('SELECT * FROM UserProfile WHERE authUserId = ?');
        const player1Profile = getPlayer1Stmt.get(player1Id);
        const getPlayer2Stmt = fastify.db.prepare('SELECT * FROM UserProfile WHERE authUserId = ?');
        const player2Profile = getPlayer2Stmt.get(player2Id);

        console.log(`[${request.id}] Player1 profile:`, player1Profile);
        console.log(`[${request.id}] Player2 profile:`, player2Profile);

        // Verify both profiles exist before proceeding
        if (!player1Profile) {
          console.error(`[${request.id}] Player1 profile not found for authUserId: ${player1Id}`);
          return reply.status(400).send({ error: `Player profile not found for user ${player1Id}` });
        }
        if (!player2Profile) {
          console.error(`[${request.id}] Player2 profile not found for authUserId: ${player2Id}`);
          return reply.status(400).send({ error: `Player profile not found for user ${player2Id}` });
        }

        // retrieve date or create it
        let matchDate = new Date().toISOString();
        if (date)
          matchDate = new Date(date).toISOString();

        let finalWinnerId = null; // In case of draw
        if (player1Score > player2Score)
          finalWinnerId = player1Profile.id;
        else if (player1Score < player2Score)
          finalWinnerId = player2Profile.id;

        console.log(`[${request.id}] Match details - player1Id: ${player1Profile.id}, player2Id: ${player2Profile.id}, scores: ${player1Score}-${player2Score}, winnerId: ${finalWinnerId}`);

        const insertMatchStmt = fastify.db.prepare(
          'INSERT INTO Match (type, date, player1Id, player2Id, player1Score, player2Score, winnerId) VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        const result = insertMatchStmt.run(
          type,
          matchDate,
          player1Profile.id,
          player2Profile.id,
          player1Score,
          player2Score,
          finalWinnerId
        );

        // Get created match
        const getMatchStmt = fastify.db.prepare('SELECT * FROM Match WHERE id = ?');
        const match = getMatchStmt.get(Number(result.lastInsertRowid));
        
        console.log(`[${request.id}] Match created successfully:`, match);
        return { message: 'Match created successfully', match };
      }

      // Check if user profile exists
      const getUserStmt = fastify.db.prepare('SELECT * FROM UserProfile WHERE authUserId = ?');
      const existingUser = getUserStmt.get(userId);

      if (!existingUser) {
        return reply.status(404).send({ error: 'User profile not found' });
      }

      // Update user profile
      const updateFields = [];
      const updateValues = [];
      
      console.log(`[${request.id}] Checking fields - name: ${updateData.name}, profilePicture: ${updateData.profilePicture?.substring(0, 50)}, bio: ${updateData.bio}`);
      
      if (updateData.name !== undefined) {
        // Check for name uniqueness if name is being updated
        const checkNameStmt = fastify.db.prepare(
          'SELECT * FROM UserProfile WHERE name = ? AND authUserId != ?'
        );
        const existingName = checkNameStmt.get(updateData.name, userId);
        if (existingName) {
          return reply.status(400).send({ error: 'Username already taken' });
        }
        updateFields.push('name = ?');
        updateValues.push(updateData.name);
      }
      if (updateData.profilePicture !== undefined) {
        updateFields.push('profilePicture = ?');
        updateValues.push(updateData.profilePicture);
      }
      if (updateData.bio !== undefined) {
        updateFields.push('bio = ?');
        updateValues.push(updateData.bio);
      }

      if (updateFields.length > 0) {
        updateFields.push('updatedAt = datetime(\'now\')');
        updateValues.push(userId); // Add userId at the end for WHERE clause

        const sql = `UPDATE UserProfile SET ${updateFields.join(', ')} WHERE authUserId = ?`;
        console.log(`[${request.id}] Executing SQL:`, sql);
        console.log(`[${request.id}] With values:`, updateValues);
        
        const updateStmt = fastify.db.prepare(sql);
        const result = updateStmt.run(...updateValues);
        
        console.log(`[${request.id}] Update result - changes: ${result.changes}`);
      } else {
        console.log(`[${request.id}] No fields to update, returning existing user`);
        return { user: existingUser };
      }

      // Get updated user with fresh query
      const getUpdatedUserStmt = fastify.db.prepare('SELECT * FROM UserProfile WHERE authUserId = ?');
      const updatedUser = getUpdatedUserStmt.get(userId);
      
      console.log(`[${request.id}] Updated user - profilePicture: ${updatedUser?.profilePicture?.substring(0, 50)}, bio: ${updatedUser?.bio}`);

      if (!updatedUser) {
        return reply.status(404).send({ error: 'User profile not found' });
      }

      return { user: updatedUser };
    } catch (err) {
      console.error(`[${request.id}] Error in POST /users/me:`, err);
      fastify.log.error('Profile update error:', err);
      
      // JWT verification errors should return 401
      if (err.message && (err.message.includes('jwt') || err.message.includes('token') || err.message.includes('Unauthorized'))) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }
      
      // Check for unique constraint violation
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return reply.status(400).send({ error: 'Username already taken' });
      }
      
      // Return more specific error for debugging
      return reply.status(500).send({ 
        error: 'Failed to update profile',
        message: err.message 
      });
    }
  });

}

