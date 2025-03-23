import db from '../db.js';

const addScoreHandler = (req, reply) =>
{
	const {user_id, opponent_id, score_user} = req.body;
	if (!user_id || !opponent_id || !score_user)
		return reply.status(400).send({message: "All fields are mandatory."});
	db.run('INSERT INTO scores(user_id, opponent_id, score_user) VALUES (?, ?, ?)', [user_id, opponent_id, score_user], (err) => 
	{
		if (err)
			return reply.status(500).send({ message: "Database error" });
		return reply.status(200).send({ message: "Score added" });
	});
};
	
const addScoreSchema = 
{
	body:
	{
		type: 'object',
		required: ['user_id', 'opponent_id', 'score_user'],
		properties:
		{
			user_id: { type: 'integer' },
			opponent_id: { type: 'integer' },
			score_user: { type: 'integer' }
		},
	},
	response: 
	{
		200: 
		{ 
			type: 'object',
			properties: 
			{
				message: { type: 'string' }
			}
		}
	}
};

const addScoreOpts=
{
	schema: addScoreSchema,
	handler: addScoreHandler ,
};
	
export { addScoreHandler, addScoreSchema };