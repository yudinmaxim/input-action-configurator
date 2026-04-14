use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ConfigResult {
    pub success: bool,
    pub content: Option<String>,
    pub error: Option<String>,
}

#[tauri::command]
fn get_config_path() -> String {
    let config_dir = dirs::config_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("inputactions");
    
    config_dir.join("test.config.yaml")
        .to_string_lossy()
        .to_string()
}

#[tauri::command]
fn read_config() -> ConfigResult {
    let config_path = get_config_path();
    let path = PathBuf::from(&config_path);
    
    // Ensure directory exists
    if let Some(parent) = path.parent() {
        if !parent.exists() {
            if let Err(e) = fs::create_dir_all(parent) {
                return ConfigResult {
                    success: false,
                    content: None,
                    error: Some(format!("Failed to create config directory: {}", e)),
                };
            }
        }
    }
    
    // Read file if exists
    if path.exists() {
        match fs::read_to_string(&path) {
            Ok(content) => ConfigResult {
                success: true,
                content: Some(content),
                error: None,
            },
            Err(e) => ConfigResult {
                success: false,
                content: None,
                error: Some(format!("Failed to read config: {}", e)),
            },
        }
    } else {
        // Return empty config
        ConfigResult {
            success: true,
            content: Some(String::new()),
            error: None,
        }
    }
}

#[tauri::command]
fn write_config(content: String) -> ConfigResult {
    let config_path = get_config_path();
    let path = PathBuf::from(&config_path);
    
    // Ensure directory exists
    if let Some(parent) = path.parent() {
        if !parent.exists() {
            if let Err(e) = fs::create_dir_all(parent) {
                return ConfigResult {
                    success: false,
                    content: None,
                    error: Some(format!("Failed to create config directory: {}", e)),
                };
            }
        }
    }
    
    // Write file
    match fs::write(&path, &content) {
        Ok(_) => ConfigResult {
            success: true,
            content: Some(config_path),
            error: None,
        },
        Err(e) => ConfigResult {
            success: false,
            content: None,
            error: Some(format!("Failed to write config: {}", e)),
        },
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_config_path,
            read_config,
            write_config
        ])
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();
            window.set_title("Input Action Configurator").unwrap();
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
