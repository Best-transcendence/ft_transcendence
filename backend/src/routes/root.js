export default async function (fastify, opts) {
    fastify.get('/', async (req, reply) => {
        return { hello: 'world' };
    });
}
