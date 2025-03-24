import { enable2FAHandler } from '../crud/enable2fa.js'
import { verify2FAHandler } from '../crud/verify2fa.js'

export default async function twofaRoutes(fastify, options) 
{
	fastify.post('/enable-2fa',
	{
		preHandler: fastify.authenticate
	}, enable2FAHandler);
	fastify.post('/verify-2fa',
	{
		preHandler: fastify.authenticate
	}, verify2FAHandler);
}