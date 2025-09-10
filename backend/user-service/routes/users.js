// User management routes for user service
export default async function (fastify, opts) {
    
    // GET /users - Get all user profiles
    fastify.get('/', {
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
                            id: { type: 'integer', example: 1 },
                            name: { type: 'string', example: 'John Doe' },
                            email: { type: 'string', example: 'john@example.com' },
                            profilePicture: { type: 'string', nullable: true, example: 'https://example.com/avatar.jpg' },
                            bio: { type: 'string', nullable: true, example: 'Pong enthusiast!' },
                            createdAt: { type: 'string', format: 'date-time' }
                        }
                    }
                }
            }
        }
    }, async (req, reply) => {
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

    // GET /users/me - Get current user profile
    fastify.get("/me", {
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
                                id: { type: 'integer', example: 1 },
                                authUserId: { type: 'integer', example: 1 },
                                name: { type: 'string', example: 'John Doe' },
                                email: { type: 'string', example: 'john@example.com' },
                                profilePicture: { type: 'string', nullable: true },
                                bio: { type: 'string', nullable: true },
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
                        error: { type: 'string', example: 'Unauthorized' }
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
                where: { authUserId: request.user.id }
            });

            if (!user) {
                return reply.status(404).send({ error: "User profile not found" });
            }

            return { user };
        } catch (err) {
            return reply.status(401).send({ error: "Unauthorized" });
        }
    });
}
