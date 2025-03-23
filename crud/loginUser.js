import db from '../db.js';
import bcrypt from 'bcrypt';
import { promisify } from 'util';

const loginUserHandler = async (request, reply) => 
{
	const {email, password} = request.body;
	if (!email || !password)
		return reply.code(400).send({ message: "All fields are mandatory" });
	const getAsync = promisify(db.get).bind(db);
	try 
	{
		const row = await getAsync("SELECT * FROM users WHERE email = ?", [email]);
		if (!row)
			return reply.code(401).send({ message: "Invalid credentials" });
		const match = await bcrypt.compare(password, row.password);
		if (!match)
			return reply.code(401).send({ message: "Invalid credentials" });
		const token = reply.server.jwt.sign({ id: row.id, email: row.email });
		reply.send({token});
	}
	catch (err)
	{
		console.error(err);
		reply.code(500).send({ message: "Database error" });
	}
};

export {loginUserHandler};

