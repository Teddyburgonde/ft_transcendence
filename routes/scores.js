import {addScoreHandler, addScoreSchema } from '../crud/postScore.js'

export default async function scoresRoutes(fastify, options) 
{	
	fastify.post('/scores', 
	{
		schema: addScoreSchema,
		handler: addScoreHandler
	});
}
