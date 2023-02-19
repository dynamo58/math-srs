CREATE TABLE IF NOT EXISTS sets (
	id           INTEGER PRIMARY KEY,
	name         TEXT NOT NULL,
	uuid         TEXT NOT NULL,
	-- UNIX timestamp
	last_revised TEXT,
	is_foreign   INTEGER DEFAULT 0,
	description  TEXT DEFAULT "",
	question_count INTEGER DEFAULT 0
);