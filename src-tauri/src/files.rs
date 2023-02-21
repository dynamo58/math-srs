use std::path::PathBuf;

use crate::Retainer;
use anyhow::Context;
use directories::ProjectDirs;
use rusqlite::Connection;
use uuid::Uuid;

#[macro_export]
macro_rules! create_file_if_not_exists {
    ($a: expr) => {
        if !$a.is_file() {
            std::fs::File::create($a)?;
        }
    };
}

#[macro_export]
macro_rules! create_dir_if_not_exists {
    ($a: expr) => {
        if !$a.is_dir() {
            std::fs::create_dir($a)?;
        }
    };
}

pub fn check_integrity_and_retain(conf: &crate::Config) -> anyhow::Result<Retainer> {
	let data_path = match &conf.custom_data_dir {
		Some(dir) => dir.clone(),
		None => {
			let project_dirs = ProjectDirs::from("com", "Marek Smolik", "math-srs").context("lol")?;

			project_dirs.data_dir().to_path_buf()
		}
	};
    
    let sets_db_path = data_path.join("sets.db");

    create_dir_if_not_exists!(data_path.clone());
    create_file_if_not_exists!(sets_db_path.clone());

    let conn = Connection::open(sets_db_path.clone())?;
    conn.execute(include_str!("../../schema/sets.sql"), [])?;

    Ok(Retainer::new(conn, data_path))
}

pub fn create_set_files(data_path: std::path::PathBuf) -> anyhow::Result<(PathBuf, String)> {
    let uuid = Uuid::new_v4().to_string();
    let set_path = data_path.join(uuid.clone());
    let db_path = set_path.join("questions.db");
    let assets_db_path = set_path.join("assets");

    std::fs::create_dir(set_path)?;
    std::fs::create_dir(assets_db_path)?;
    std::fs::File::create(db_path.clone())?;

    Ok((db_path, uuid))
}

pub fn get_set_db_path(data_path: std::path::PathBuf, uuid: String) -> PathBuf {
    data_path
        .join(uuid.clone())
        .join("questions.db")
}

pub fn remove_whole_set_dir(data_path: std::path::PathBuf, set_uuid: String) -> anyhow::Result<()> {
    Ok(std::fs::remove_dir_all(data_path.join(set_uuid))?)
}
