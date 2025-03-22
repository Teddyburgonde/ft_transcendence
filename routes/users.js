import { addUserHandler, addUserSchema } from '../crud/postUser.js';
import { getAllUsersHandler } from '../crud/getUsers.js';
import { getUserById } from '../crud/getUserById.js'
import { updateUser } from '../crud/updateUser.js'
import { deleteUserById } from '../crud/deleteUser.js';
import { loginUserHandler } from '../crud/loginUser.js';


export default async function usersRoutes(fastify, options) 
{
	fastify.post('/users', 
	{
		schema: addUserSchema,
		handler: addUserHandler
	});
	fastify.get('/users', getAllUsersHandler);
	fastify.get('/users/:id', getUserById);
	fastify.put('/users/:id', updateUser )
	fastify.delete('/users/:id', deleteUserById);
	fastify.post('/login', loginUserHandler);
}