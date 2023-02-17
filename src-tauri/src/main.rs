#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use math_srs::{commands, files};

fn main() -> anyhow::Result<()> {
    let ret = files::check_file_integrity()?;

    tauri::Builder::default()
        .manage(std::sync::Mutex::new(ret))
        .invoke_handler(tauri::generate_handler![
            commands::get_sets,
            commands::create_set,
            commands::create_set,
            commands::edit_set,
            commands::add_question_to_set,
            commands::get_set_questions
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    Ok(())
}
