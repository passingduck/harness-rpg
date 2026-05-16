use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BridgeEvent {
    pub event_type: String,
    pub node_id: String,
    pub agent_id: String,
    pub skills: Vec<String>,
}

fn state_dir() -> PathBuf {
    PathBuf::from(".harness-rpg")
}

pub fn save_state(state_json: String) -> Result<String, String> {
    let dir = state_dir();
    fs::create_dir_all(&dir).map_err(|error| error.to_string())?;
    let path = dir.join("state.json");
    fs::write(&path, state_json).map_err(|error| error.to_string())?;
    Ok(path.to_string_lossy().to_string())
}

pub fn load_state() -> Result<Option<String>, String> {
    let path = state_dir().join("state.json");
    if !path.exists() {
        return Ok(None);
    }
    fs::read_to_string(path).map(Some).map_err(|error| error.to_string())
}

pub fn append_bridge_event(event: BridgeEvent) -> Result<String, String> {
    let dir = state_dir();
    fs::create_dir_all(&dir).map_err(|error| error.to_string())?;
    let path = dir.join("bridge-events.jsonl");
    let line = serde_json::to_string(&event).map_err(|error| error.to_string())?;
    fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(&path)
        .and_then(|mut file| {
            use std::io::Write;
            writeln!(file, "{line}")
        })
        .map_err(|error| error.to_string())?;
    Ok(path.to_string_lossy().to_string())
}

/// Entry point placeholder for the Tauri desktop shell.
///
/// The command functions above are intentionally framework-light so this crate
/// can be checked in environments that do not yet have the Tauri MSRV/toolchain.
/// They are ready to be registered with `tauri::Builder::invoke_handler` when
/// the desktop runner is enabled.
pub fn run() {
}
