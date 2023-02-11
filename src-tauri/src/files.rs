use std::sync::Mutex;

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

pub fn create_set(ret: &mut Retainer, name: String, desc: String) -> anyhow::Result<String> {
    let uuid = Uuid::new_v4().to_string();
    let project_dirs = ProjectDirs::from("com", "Marek Smolik", "math-srs").context("lol")?;
    let data_path = project_dirs.data_dir();
    let set_path = data_path.join(uuid.clone());
    let db_path = set_path.join("questions.db");
    let assets_db_path = set_path.join("assets");

    std::fs::create_dir(set_path)?;
    std::fs::create_dir(assets_db_path)?;
    std::fs::File::create(db_path.clone())?;

    let conn = Connection::open(db_path.clone())?;
    conn.execute(include_str!("../../schema/questions.sql"), [])?;

    let sets_db_conn = ret.sets_db.lock().unwrap();

    // .expect("THIS SHOULD ALWAYS BE REACHABLE Clueless");
    sets_db_conn.execute(
        "INSERT INTO sets (name, uuid, description) values (?1, ?2, ?3);",
        [name, uuid.clone(), desc],
    )?;

    ret.databases.insert(db_path, Mutex::new(conn));

    Ok(uuid)
}
