import db from '../db.js';

const updateUser = (request, reply) =>
{
	const { id } = request.params;
	const {username, email, password} = request.body;
	if (!username || !email || !password)
		return reply.status(400).send({ message: "All fields are mandatory" });
	db.run("UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?", [username, email, password, id],
		function (err)
		{
			if (err)
				return reply.status(500).send({ message: "Database error" });
			if (this.changes === 0)
				return reply.status(404).send({ message: "User not found" });
			return reply.status(200).send({ message: "User updated successfully" });
		}
	);
};

export { updateUser };
