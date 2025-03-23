import db from '../db.js'

const deleteScoreById = (request, reply) =>
{
	const {id} = request.params;
	db.run("DELETE FROM scores WHERE id = ?", [id], function (err)
	{
		if (err)
			return reply.status(500).send({ message: "Database error" });
		if (this.changes === 0)
			return reply.status(404).send({ message: "Score not found" });
		return reply.status(200).send({ message: "Score deleted successfully" });
	})
}

export { deleteScoreById }

