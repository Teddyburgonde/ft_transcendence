import db from '../db.js';

const addUserHandler = (req, reply) =>
{
	const {username, email, password} = req.body;
	if (!username || !email || !password)
		return reply.status(400).send({message: "All fields are mandatory."});
	db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) =>
	{
		if (err)
			return reply.status(500).send({ message: "Database error" });
		if (row)
			return reply.status(400).send({message: "This email already exists."});
		db.run('INSERT INTO users(username, email, password) VALUES (?, ?, ?)', [username, email, password], (err) => 
		{
			if (err)
				return reply.status(500).send({ message: "Database error" });
			reply.send({ "message": "User added" });	
		});
	});
};
	
const addUserSchema = 
{
	body:
	{
		type: 'object',
		required: ['username', 'email', 'password'],
		properties:
		{
		  username: { type: 'string' },
		  email: { type: 'string' },
		  password: { type: 'string' },
		},
	},
	response: 
	{
		200: { type: 'string' },
	},	
};
	
	
const addUserOpts=
{
	schema: addUserSchema,
	handler: addUserHandler,
};
	
export { addUserHandler, addUserSchema };