import { addScoreHandler, addScoreSchema } from '../crud/postScore.js'
import { getAllScoresHandler } from '../crud/getScores.js'
import { getScoresByUserId } from '../crud/getScoreByUserId.js';
import { deleteScoreById } from '../crud/deleteScore.js';

export default async function scoresRoutes(fastify, options) 
{	
	fastify.post('/scores', 
	{
		schema: addScoreSchema,
		handler: addScoreHandler
	});
	fastify.get('/scores', getAllScoresHandler);
	fastify.get('/scores/user/:id', getScoresByUserId);
	fastify.delete('/scores/:id', deleteScoreById);

}
