// Import the framework
import Fastify from 'fastify'

// Import des routes
import homeRoutes from './routes/home.js';
import usersRoutes from './routes/users.js';
import scoresRoutes from './routes/scores.js';

// Fastify function to create a server
const fastify = Fastify(
{
	// different options

	// Activate logs
	logger: true
})

// Register routes
fastify.register(homeRoutes);
fastify.register(usersRoutes);
fastify.register(scoresRoutes);


// Run the server
try 
{
	await fastify.listen({ port: 3000, host: '0.0.0.0' })
}
catch (err)
{
	fastify.log.error(err)
	process.exit(1)
}