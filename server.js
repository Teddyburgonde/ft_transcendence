// Import the framework
import Fastify from 'fastify'
import fastifyJwt from '@fastify/jwt';
import dotenv from 'dotenv';
import fastifyTOTP from 'fastify-totp';

// Import des routes
import homeRoutes from './routes/home.js';
import usersRoutes from './routes/users.js';
import scoresRoutes from './routes/scores.js';
import twofaRoutes from './routes/2fa.js';


dotenv.config();

// Fastify function to create a server
const fastify = Fastify(
{
	// Different options
	
	// Activate logs
	logger: true
})

fastify.register(twofaRoutes);
fastify.register(fastifyTOTP);

fastify.register(fastifyJwt,
{
	secret: process.env.JWT_SECRET
});

fastify.decorate("authenticate", async function (request, reply)
{
	try
	{
		await request.jwtVerify(); // Check that the token is signed and with the correct key
	}
	catch (err)
	{
		reply.send(err);
	}
});

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