#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use math_srs::{commands, files, Config};

fn main() -> anyhow::Result<()> {
	let conf = Config::load()?;
    let ret = files::check_integrity_and_retain(&conf)?;

    tauri::Builder::default()
        .manage(std::sync::Mutex::new(ret))
        .invoke_handler(tauri::generate_handler![
            commands::create_set,
            commands::get_sets,
            commands::edit_set,
			commands::delete_set,
            commands::add_question_to_set,
            commands::get_set_questions,
			commands::edit_question_in_set,
			commands::delete_question_from_set,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    Ok(())
}
