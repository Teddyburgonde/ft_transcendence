import db from '../db.js'
import {promisify} from 'util'

const verify2FAHandler = async (request, reply) =>
{
	const userId = request.user.id;
	const {token} = request.body;

	const getAsync = promisify(db.get).bind(db);
	const row = await getAsync("SELECT twofa_secret FROM users WHERE id = ?", [userId]);

	if (!row || !row.twofa_secret)
		return reply.status(400).send({ message: "2FA not set up for this user" });
	const secret = row.twofa_secret;
	const isValid = request.server.totp.verify({secret, token});
	if (isValid)
		return reply.status(200).send({message:"2FA verified"});
	return reply.status(401).send({message:"Invalid 2FA code"});
}

export { verify2FAHandler };