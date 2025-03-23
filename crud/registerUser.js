import db from '../db.js'
import bcrypt from 'bcrypt';
import { promisify } from 'util';

const registerUserHandler = async (request, reply) =>
{
	const {username, email, password} = request.body;
	if (!username || !email || !password)
		return reply.status(400).send({message: "All fields are mandatory."});
	const getAsync = promisify(db.get).bind(db);
	const runAsync = promisify(db.run).bind(db);
	try
	{
		const row = await getAsync("SELECT * FROM users WHERE email = ?", [email]);
		if (row)
			return reply.status(400).send({message: "This email already exists."});
		const hashedPassword = await bcrypt.hash(password, 10);
		await runAsync("INSERT INTO users(username, email, password) VALUES (?, ?, ?)", [username, email, hashedPassword]);
		reply.send({ message: "User registered" });
	}
	catch (err)
	{
		console.error(err);
		reply.status(500).send({ message: "Database error" });
	}
};

export { registerUserHandler }; 