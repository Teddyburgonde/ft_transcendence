export default async function usersRoutes(fastify, options) {
	fastify.route({
		method: 'GET',
		url: '/users',
		schema: {
		querystring: {
			type: 'object',
			properties: {
			name: { type: 'string' },
			excitement: { type: 'integer' }
			}
		},
		response: {
			200: {
			type: 'object',
			properties: {
				hello: { type: 'string' }
			}
			}
		}
		},
		handler: function (request, reply) 
		{
			reply.send("JE SUIS SUR LA PAGE USERS")
		}
	})
}