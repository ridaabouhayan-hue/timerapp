// Geen extra consolevenster in de release-build op Windows.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tijdvak_lib::run()
}
