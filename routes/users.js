import { addUserHandler, addUserSchema } from '../crud/postUser.js';

export default async function usersRoutes(fastify, options) 
{
	fastify.post('/users', 
	{
		schema: addUserSchema,
		handler: addUserHandler
	});
	fastify.get('/users', (request, reply) =>
	{
		reply.send("JE SUIS SUR LA PAGE USERS");
	});
}