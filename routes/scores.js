import { addScoreHandler, addScoreSchema } from '../crud/postScore.js'
import { getAllScoresHandler } from '../crud/getScores.js'
import { getScoresByUserId } from '../crud/getScoreByUserId.js';
import { deleteScoreById } from '../crud/deleteScore.js';

export default async function scoresRoutes(fastify, options) 
{	
	fastify.post('/scores',
	{
		preHandler: fastify.authenticate,
		schema: addScoreSchema,
		handler: addScoreHandler
	});
	fastify.get('/scores', 
	{
		preHandler: fastify.authenticate
	}, getAllScoresHandler);
	fastify.get('/scores/user/:id', 
	{
		preHandler: fastify.authenticate
	},	getScoresByUserId);
	fastify.delete('/scores/:id', 
	{
		preHandler: fastify.authenticate
	}, deleteScoreById);
}
