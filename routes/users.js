import { addUserHandler, addUserSchema } from '../crud/postUser.js';
import { getAllUsersHandler } from '../crud/getUsers.js';
import {  getUserById } from '../crud/getUserById.js'

export default async function usersRoutes(fastify, options) 
{
	fastify.post('/users', 
	{
		schema: addUserSchema,
		handler: addUserHandler
	});
	fastify.get('/users', getAllUsersHandler);
	fastify.get('/users/:id', getUserById);
}