import db from '../db.js';

const getAllUsersHandler = (request, reply) =>
{
	db.all("SELECT * FROM users", (err, rows) =>
	{
		if (err)
			return reply.status(500).send({ message: "Database error" });
		reply.send(rows);
	})
};

export { getAllUsersHandler };