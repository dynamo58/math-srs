pub mod files;
pub mod models;

use rusqlite::Connection;
use std::sync::{Arc, Mutex};

pub struct Retainer {
    pub sets_db: Mutex<Connection>,
    pub databases: std::collections::HashMap<std::path::PathBuf, Mutex<Connection>>,
}

impl Retainer {
    pub fn new(sets_db: Connection) -> Retainer {
        Retainer {
            sets_db: Mutex::new(sets_db),
            databases: std::collections::HashMap::new(),
        }
    }
}
