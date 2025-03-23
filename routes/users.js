import { addUserHandler, addUserSchema } from '../crud/postUser.js';
import { getAllUsersHandler } from '../crud/getUsers.js';
import { getUserById } from '../crud/getUserById.js'
import { updateUser } from '../crud/updateUser.js'
import { deleteUserById } from '../crud/deleteUser.js';
import { loginUserHandler } from '../crud/loginUser.js';
import {registerUserHandler } from '../crud/registerUser.js'

export default async function usersRoutes(fastify, options) 
{
	fastify.post('/users', 
	{
		schema: addUserSchema,
		handler: addUserHandler
	});
	fastify.get('/users', 
	{
		// fastify.authenticate checks whether a JWT token is present
		// in the headers and if it is valid (signed with the correct secret key)
		preHandler: fastify.authenticate
	},	getAllUsersHandler);
	fastify.get('/users/:id', 
	{
		preHandler: fastify.authenticate
	},	getUserById);
	fastify.put('/users/:id', 
	{
		preHandler: fastify.authenticate
	},	updateUser )
	fastify.delete('/users/:id',
	{
		preHandler: fastify.authenticate
	},	deleteUserById);
	fastify.post('/login', loginUserHandler);
	fastify.post('/register', registerUserHandler);
}