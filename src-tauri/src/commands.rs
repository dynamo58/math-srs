use crate::{files, models, Retainer};
use rusqlite::{params, Connection};
use serde::{ser::Serializer, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::State;

#[derive(thiserror::Error, Debug)]
pub enum CommandError {
    #[error("the set provided doesn't exist")]
    SetDoesntExist,
    #[error("an unexpected IO error occured")]
    IOError,
    #[error(transparent)]
    RusqliteError(#[from] rusqlite::Error),
    #[error(transparent)]
    AnyhowError(#[from] anyhow::Error),
    #[error(transparent)]
    SystemTimeError(#[from] std::time::SystemTimeError),
}

impl Serialize for CommandError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

pub type CommandResult<T, E = CommandError> = anyhow::Result<T, E>;

// =============================================================================
// SETS SCRUD
// =============================================================================

#[tauri::command]
pub fn create_set(
    ret: State<std::sync::Mutex<Retainer>>,
    name: String,
    desc: String,
) -> CommandResult<models::Set> {
    let mut ret = ret.inner().lock().unwrap();
    let (set_db_path, uuid) = files::create_set_files(ret.data_path.clone())?;

    let conn = Connection::open(set_db_path.clone())?;
    conn.execute(include_str!("../../schema/questions.sql"), [])?;

    ret.sets_db.execute(
        "INSERT INTO sets (name, uuid, description) values (?1, ?2, ?3);",
        [name.clone(), uuid.clone(), desc.clone()],
    )?;

    ret.databases.insert(uuid.clone(), conn);
    Ok(models::Set {
        id: 0,
        name,
        description: Some(desc),
        uuid,
        last_revised: None,
        is_foreign: false,
        question_count: 0,
    })
}

#[tauri::command]
pub fn get_sets(state: State<'_, std::sync::Mutex<Retainer>>) -> CommandResult<Vec<models::Set>> {
    let db = &state.inner().lock().unwrap().sets_db;

    let mut stmt = db.prepare("SELECT * FROM sets")?;

    let sets: Vec<models::Set> = stmt
        .query_map([], |row| {
            Ok(models::Set {
                id: row.get(0)?,
                name: row.get(1)?,
                uuid: row.get(2)?,
                last_revised: row.get(3)?,
                is_foreign: row.get(4)?,
                description: row.get(5)?,
                question_count: row.get(6)?,
            })
        })?
        .map(|r| r.unwrap())
        .collect();

    return Ok(sets);
}

#[tauri::command]
pub fn edit_set(
    ret: State<std::sync::Mutex<Retainer>>,
    set_uuid: String,
    new_name: String,
    new_desc: String,
) -> CommandResult<()> {
    let ret = ret.inner().lock().unwrap();
    ret.sets_db.execute(
        "UPDATE sets SET name = ?1, description = ?2 WHERE uuid = ?3;",
        [new_name, new_desc, set_uuid.clone()],
    )?;
    Ok(())
}

#[tauri::command]
pub fn delete_set(ret: State<std::sync::Mutex<Retainer>>, set_uuid: String) -> CommandResult<()> {
    let ret = ret.inner().lock().unwrap();

    ret.sets_db
        .execute("DELETE FROM sets WHERE uuid = ?1;", [set_uuid.clone()])?;
    files::remove_whole_set_dir(ret.data_path.clone(), set_uuid)?;

    Ok(())
}

// =============================================================================
// QUESTIONS CRUD
// =============================================================================

#[tauri::command]
pub fn add_question_to_set(
    ret: State<std::sync::Mutex<Retainer>>,
    set_uuid: String,
    ser_question: String,
    ser_answer: String,
) -> CommandResult<i64> {
    let mut ret = ret.inner().lock().unwrap();
    let insert_row_id: i64;

    if let Some(conn) = ret.databases.get(&set_uuid) {
        conn.execute(
            "INSERT INTO questions (ser_question, ser_answer) values (?1, ?2);",
            [ser_question, ser_answer],
        )?;
        insert_row_id = conn.last_insert_rowid();
    } else if files::get_set_db_path(ret.data_path.clone(), set_uuid.clone()).is_file() {
        let path = files::get_set_db_path(ret.data_path.clone(), set_uuid.clone());
        let conn = Connection::open(path)?;

        conn.execute(
            "INSERT INTO questions (ser_question, ser_answer) values (?1, ?2);",
            [ser_question, ser_answer],
        )?;

        insert_row_id = conn.last_insert_rowid();

        ret.databases.insert(set_uuid.clone(), conn);
    } else {
        return Err(CommandError::SetDoesntExist);
    }

    ret.sets_db.execute(
        "UPDATE sets SET question_count = question_count + 1 WHERE uuid=?1;",
        [set_uuid],
    )?;

    Ok(insert_row_id)
}

#[tauri::command]
pub fn get_set_questions(
    state: State<'_, std::sync::Mutex<Retainer>>,
    set_uuid: String,
    is_for_revision: bool,
) -> CommandResult<Vec<models::Question>> {
    let ret = state.inner().lock().unwrap();
    let questions: Vec<models::Question>;

    if let Some(conn) = ret.databases.get(&set_uuid) {
        let mut stmt = conn.prepare("SELECT * FROM questions")?;
        questions = stmt
            .query_map([], |row| {
                Ok(models::Question {
                    id: row.get(0)?,
                    ser_question: row.get(1)?,
                    ser_answer: row.get(2)?,
                })
            })?
            .map(|r| r.unwrap())
            .collect();
    } else if files::get_set_db_path(ret.data_path.clone(), set_uuid.clone()).is_file() {
        let path = files::get_set_db_path(ret.data_path.clone(), set_uuid.clone());
        let conn = Connection::open(path)?;
        let mut stmt = conn.prepare("SELECT * FROM questions")?;
        questions = stmt
            .query_map([], |row| {
                Ok(models::Question {
                    id: row.get(0)?,
                    ser_question: row.get(1)?,
                    ser_answer: row.get(2)?,
                })
            })?
            .map(|r| r.unwrap())
            .collect();
    } else {
        return Err(CommandError::SetDoesntExist);
    }

    if is_for_revision {
        ret.sets_db.execute(
            "UPDATE sets SET last_revised = ?1 WHERE uuid = ?2",
            [
                SystemTime::now()
                    .duration_since(UNIX_EPOCH)?
                    .as_millis()
                    .to_string(),
                set_uuid,
            ],
        )?;
    }

    return Ok(questions);
}

#[tauri::command]
pub fn edit_question_in_set(
    ret: State<std::sync::Mutex<Retainer>>,
    set_uuid: String,
    question_id: u32,
    ser_question: String,
    ser_answer: String,
) -> CommandResult<()> {
    let mut ret = ret.inner().lock().unwrap();

    if let Some(conn) = ret.databases.get(&set_uuid) {
        conn.execute(
            "UPDATE questions SET ser_question = ?1, ser_answer = ?2 WHERE id = ?3",
            params![ser_question, ser_answer, question_id,],
        )?;
    } else if files::get_set_db_path(ret.data_path.clone(), set_uuid.clone()).is_file() {
        let path = files::get_set_db_path(ret.data_path.clone(), set_uuid.clone());
        let conn = Connection::open(path)?;

        conn.execute(
            "UPDATE questions SET ser_question = ?1, ser_answer = ?2 WHERE id = ?3",
            params![ser_question, ser_answer, question_id,],
        )?;

        ret.databases.insert(set_uuid, conn);
    } else {
        return Err(CommandError::SetDoesntExist);
    }

    Ok(())
}

#[tauri::command]
pub fn delete_question_from_set(
    ret: State<std::sync::Mutex<Retainer>>,
    set_uuid: String,
    question_id: u32,
) -> CommandResult<()> {
    let mut ret = ret.inner().lock().unwrap();

    if let Some(conn) = ret.databases.get(&set_uuid) {
        conn.execute("DELETE FROM questions WHERE id=?1;", [question_id])?;
    } else if files::get_set_db_path(ret.data_path.clone(), set_uuid.clone()).is_file() {
        let path = files::get_set_db_path(ret.data_path.clone(), set_uuid.clone());
        let conn = Connection::open(path)?;

        conn.execute("DELETE FROM questions WHERE id=?1;", [question_id])?;
        ret.databases.insert(set_uuid.clone(), conn);
    } else {
        return Err(CommandError::SetDoesntExist);
    }

    ret.sets_db.execute(
        "UPDATE sets SET question_count = question_count - 1 WHERE uuid=?1;",
        [set_uuid.clone()],
    )?;

    Ok(())
}
