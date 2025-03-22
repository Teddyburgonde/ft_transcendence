import db from '../db.js';

const getAllUsersHandler = (request, reply) =>
{
	db.all("SELECT id, username, email, avatar, create_at FROM users", (err, rows) =>
	{
		if (err)
			return reply.status(500).send({ message: "Database error" });
		reply.send(rows);
	})
};

export { getAllUsersHandler };