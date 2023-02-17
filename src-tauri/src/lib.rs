pub mod files;
pub mod models;
pub mod commands;

use rusqlite::Connection;

pub struct Retainer {
    pub sets_db: Connection,
    pub databases: std::collections::HashMap<String, Connection>,
}

impl Retainer {
    pub fn new(sets_db: Connection) -> Retainer {
        Retainer {
            sets_db,
            databases: std::collections::HashMap::new(),
        }
    }
}
