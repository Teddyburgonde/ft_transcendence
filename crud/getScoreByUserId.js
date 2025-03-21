import db from '../db.js';

const  getScoresByUserId  = (request, reply) =>
{
	const { id } = request.params;
	db.all("SELECT * FROM scores WHERE user_id = ?", [id], (err, rows) => 
	{
		if (err)
		  return reply.status(500).send({ message: "Database error" });
		if (rows.length === 0)
		  return reply.status(404).send({ message: "No scores found for this user" });
		reply.send(rows);
	});
};

export { getScoresByUserId };