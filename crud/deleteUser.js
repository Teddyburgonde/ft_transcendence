import db from '../db.js';

const deleteUserById = (request, reply) =>
{
	const { id } = request.params;
	db.run("DELETE FROM users WHERE id = ?", [id], function (err)
	{
		if (err)
			return reply.status(500).send({ message: "Database error" });
		if (this.changes === 0)
			return reply.status(404).send({ message: "User not found" });
		return reply.status(200).send({ message: "User deleted successfully"});
	})
};

export { deleteUserById };
