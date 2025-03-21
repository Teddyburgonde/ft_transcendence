import {addScoreHandler, addScoreSchema } from '../crud/postScore.js'
import {getAllScoresHandler } from '../crud/getScores.js'

export default async function scoresRoutes(fastify, options) 
{	
	fastify.post('/scores', 
	{
		schema: addScoreSchema,
		handler: addScoreHandler
	});
	fastify.get('/scores', getAllScoresHandler);
}
