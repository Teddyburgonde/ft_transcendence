import db from '../db.js';

const getUserById = (request, reply) =>
{
	const { id } = request.params;
	db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) =>
	{
		if (err)
			return reply.status(500).send({ message: "Database error" });
		if (!row)
			return reply.status(404).send({ message: "User not found" });
		const { id, username, email, avatar, create_at } = row;
		reply.send({ id, username, email, avatar, create_at });
	})
};

export { getUserById };