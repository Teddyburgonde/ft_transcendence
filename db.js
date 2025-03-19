const sqlite3 = require('sqlite3').verbose();

// Open database or create database if not exist

const db = new sqlite3.Database('./database.db', (err) =>
{
	if (err)
		console.error('error opening database', err.message);
	else
		console.log('successful connection');
});

db.serialize(()=>
{
	db.run(`CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		username TEXT UNIQUE NOT NULL,
		email TEXT UNIQUE NOT NULL,
		password TEXT NOT NULL,
		avatar TEXT,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	)`);
	db.run(`CREATE TABLE IF NOT EXISTS scores (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		user_id INTEGER NOT NULL,
		opponent_id INTEGER NOT NULL,
		score_user INTEGER NOT NULL,
		FOREIGN KEY(user_id) REFERENCES users(id),
		FOREIGN KEY(opponent_id) REFERENCES users(id)
	)`);
});

module.exports = db;