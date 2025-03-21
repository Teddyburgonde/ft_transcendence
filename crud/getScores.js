import db from '../db.js'

const getAllScoresHandler = (request, reply) =>
{
	db.all("SELECT * FROM scores", (err, rows) =>
	{
		if (err)
			return reply.status(500).send({ message: "Database error" });
		reply.send(rows);
	})
};
export { getAllScoresHandler };