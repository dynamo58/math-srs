use std::path::PathBuf;

use crate::Retainer;
use anyhow::Context;
use directories::ProjectDirs;
use rusqlite::Connection;
use uuid::Uuid;

macro_rules! create_file_if_not_exists {
    ($a: expr) => {
        if !$a.is_file() {
            std::fs::File::create($a)?;
        }
    };
}

macro_rules! create_dir_if_not_exists {
    ($a: expr) => {
        if !$a.is_dir() {
            std::fs::create_dir($a)?;
        }
    };
}

pub fn check_file_integrity() -> anyhow::Result<Retainer> {
    let project_dirs = ProjectDirs::from("com", "Marek Smolik", "math-srs").context("lol")?;

    let data_path = project_dirs.data_dir();
    let sets_db_path = data_path.join("sets.db");

    create_dir_if_not_exists!(data_path);
    create_file_if_not_exists!(sets_db_path.clone());

    let conn = Connection::open(sets_db_path.clone())?;
    conn.execute(include_str!("../../schema/sets.sql"), [])?;

    Ok(Retainer::new(conn))
}

pub fn create_set_files() -> anyhow::Result<(PathBuf, String)> {
    let uuid = Uuid::new_v4().to_string();
    let project_dirs = ProjectDirs::from("com", "Marek Smolik", "math-srs").context("lol")?;
    let data_path = project_dirs.data_dir();
    let set_path = data_path.join(uuid.clone());
    let db_path = set_path.join("questions.db");
    let assets_db_path = set_path.join("assets");

    std::fs::create_dir(set_path)?;
    std::fs::create_dir(assets_db_path)?;
    std::fs::File::create(db_path.clone())?;

    Ok((db_path, uuid))
}

pub fn get_set_db_path(uuid: String) -> PathBuf {
    let project_dirs = ProjectDirs::from("com", "Marek Smolik", "math-srs").unwrap();

    return project_dirs
        .data_dir()
        .join(uuid.clone())
        .join("questions.db");
}

pub fn remove_whole_set_dir(set_uuid: String) -> anyhow::Result<()> {
    let project_dirs = ProjectDirs::from("com", "Marek Smolik", "math-srs").context("lol")?;
    #[allow(unused_must_use)]
    std::fs::remove_dir_all(project_dirs.data_dir().join(set_uuid))?;

    Ok(())
}
