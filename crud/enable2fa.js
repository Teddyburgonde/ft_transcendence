import db from '../db.js'
// je viens de tester la db ici 
import { promisify } from 'util'; 

const enable2FAHandler = async  (request, reply) =>
{
	// for use await (function async)
	const runAsync = promisify(db.run).bind(db);

	// Recupere user id login
	const userId = request.user.id;
	
	// Generates a TOTP secret 
	const secret = request.server.totp.generateSecret();

	// Generates the qrcode to be displayed 
	const qrcode = await request.server.totp.generateQRCode({ secret: secret.ascii });

	// Update user for stock the secret.ascii
	await runAsync("UPDATE users SET twofa_secret = ? WHERE id = ? ", 
	[secret.ascii, userId]);

	// return qrcode
	reply.send({qrcode});
} 

export { enable2FAHandler };