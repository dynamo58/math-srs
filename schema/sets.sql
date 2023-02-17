CREATE TABLE IF NOT EXISTS sets (
	id           INTEGER PRIMARY KEY,
	name         TEXT NOT NULL,
	uuid         TEXT NOT NULL,
	last_revised INTEGER,
	is_foreign   INTEGER DEFAULT 0,
	description  TEXT DEFAULT "",	
	question_count INTEGER DEFAULT 0
);