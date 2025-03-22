import db from '../db.js';

const loginUserHandler = (request, reply) => 
{
	const {email, password} = request.body;
	db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => 
	{
		if (err)
			return reply.code(500).send({ message: "Database error" });
		if (!row)
			return reply.code(401).send({ message: "Invalid credentials" });
		if (password === row.password)
		{
			const token = reply.server.jwt.sign({ id: row.id, email: row.email });
			reply.send({token});
		}
		else
			reply.code(401).send({message:"Invalid credentials"});
	});
}

export {loginUserHandler};

