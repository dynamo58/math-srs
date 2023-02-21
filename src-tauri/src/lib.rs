pub mod files;
pub mod models;
pub mod commands;

use std::io::{Write, Read};

use anyhow::Context;
use rusqlite::Connection;
use serde::{Deserialize, Serialize};

pub struct Retainer {
	pub data_path: std::path::PathBuf,
    pub sets_db: Connection,
    pub databases: std::collections::HashMap<String, Connection>,
}

impl Retainer {
    pub fn new(sets_db: Connection, data_path: std::path::PathBuf) -> Retainer {
        Retainer {
            sets_db,
			data_path,
            databases: std::collections::HashMap::new(),
        }
    }
}


#[derive(Serialize, Deserialize)]
pub struct Config {
	custom_data_dir: Option<std::path::PathBuf>,
}

impl Config {
	pub fn load() -> anyhow::Result<Config> {
		let user_dirs  = directories::ProjectDirs::from("com", "Marek Smolik", "math-srs").context("bruh")?;
		let conf_dir = user_dirs.config_dir();
		let conf_json_file_path = conf_dir.join("config.json");

		if !conf_dir.is_dir() {
            std::fs::create_dir(conf_dir)?;
		}
		
		if !conf_json_file_path.is_file() {
			let mut conf = std::fs::File::create(conf_json_file_path.clone())?;
			conf.write_all(b"{}")?;
		}

		let mut conf_file = std::fs::File::open(conf_json_file_path)?;
		let mut data = String::new();
		conf_file.read_to_string(&mut data).unwrap();
		Ok(serde_json::from_str(&data)?)
	}
}
