#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use math_srs::{files, models, Retainer};

use tauri::{Manager, State};

#[tauri::command]
fn get_sets(ret: State<'_, Retainer>) -> Vec<models::Set> {
    let db = ret.sets_db.lock().unwrap();

    let mut stmt = db.prepare("SELECT * FROM sets").unwrap();

    let sets: Vec<models::Set> = stmt
        .query_map([], |row| {
            Ok(models::Set {
                id: row.get(0)?,
                name: row.get(1)?,
                uuid: row.get(2)?,
                last_revised: row.get(3)?,
                is_foreign: row.get(4)?,
                description: row.get(5)?,
            })
        })
        .unwrap()
        .map(|r| r.unwrap())
        .collect();

    return sets;
}

fn main() -> anyhow::Result<()> {
    let mut ret = files::check_file_integrity()?;

    files::create_set(
        &mut ret,
        "Linear Algebra I".into(),
        "Linear Algebra I theory notes".into(),
    )?;

    tauri::Builder::default()
        .setup(move |app| {
            app.manage(ret);

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_sets])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    Ok(())
}
