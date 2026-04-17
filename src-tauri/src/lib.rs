use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::process::Command;
use std::sync::atomic::{AtomicBool, Ordering};
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::Manager;

const DETECTOR_SOURCE: &str = "src/entities/window-detector";
const KWIN_SCRIPTS_DIR: &str = ".local/share/kwin/scripts";
const DBUS_SERVICES_DIR: &str = ".local/share/dbus-1/services";
const BIN_DIR: &str = ".local/bin";
const FOCUSNOTIFIER_VARDIR: &str = "/tmp/FocusNotifier";

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ConfigResult {
    pub success: bool,
    pub content: Option<String>,
    pub error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct WindowInfo {
    pub title: String,
    pub class_name: String,
    pub pid: Option<u32>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct WindowInfoResult {
    pub success: bool,
    pub window: Option<WindowInfo>,
    pub error: Option<String>,
}

#[tauri::command]
fn get_config_path() -> String {
    let config_dir = dirs::config_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("inputactions");

    config_dir
        .join("test.config.yaml")
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

#[tauri::command]
fn get_gui_config_path() -> String {
    let config_dir = dirs::config_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("inputactions");

    config_dir
        .join("gui.json")
        .to_string_lossy()
        .to_string()
}

#[tauri::command]
fn read_gui_config() -> ConfigResult {
    let config_path = get_gui_config_path();
    let path = PathBuf::from(&config_path);

    // Ensure directory exists
    if let Some(parent) = path.parent() {
        if !parent.exists() {
            if let Err(e) = fs::create_dir_all(parent) {
                return ConfigResult {
                    success: false,
                    content: None,
                    error: Some(format!("Failed to create GUI config directory: {}", e)),
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
                error: Some(format!("Failed to read GUI config: {}", e)),
            },
        }
    } else {
        // Return empty JSON object
        ConfigResult {
            success: true,
            content: Some("{}".to_string()),
            error: None,
        }
    }
}

#[tauri::command]
fn write_gui_config(content: String) -> ConfigResult {
    let config_path = get_gui_config_path();
    let path = PathBuf::from(&config_path);

    // Ensure directory exists
    if let Some(parent) = path.parent() {
        if !parent.exists() {
            if let Err(e) = fs::create_dir_all(parent) {
                return ConfigResult {
                    success: false,
                    content: None,
                    error: Some(format!("Failed to create GUI config directory: {}", e)),
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
            error: Some(format!("Failed to write GUI config: {}", e)),
        },
    }
}

#[tauri::command]
fn create_config_backup(config_path: String, backup_count: u32) -> ConfigResult {
    let path = PathBuf::from(&config_path);
    if !path.exists() {
        return ConfigResult {
            success: false,
            content: None,
            error: Some("Config file does not exist".to_string()),
        };
    }

    let parent_dir = match path.parent() {
        Some(dir) => dir,
        None => {
            return ConfigResult {
                success: false,
                content: None,
                error: Some("Cannot determine parent directory".to_string()),
            }
        }
    };

    let file_name = match path.file_stem() {
        Some(name) => name.to_string_lossy().to_string(),
        None => {
            return ConfigResult {
                success: false,
                content: None,
                error: Some("Invalid file name".to_string()),
            }
        }
    };
    let extension = path.extension().map(|ext| ext.to_string_lossy().to_string()).unwrap_or_else(|| "yaml".to_string());

    // Generate timestamp
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();

    let backup_name = format!("backup_{}_{}.{}", file_name, timestamp, extension);
    let backup_path = parent_dir.join(&backup_name);

    // Copy file
    match fs::copy(&path, &backup_path) {
        Ok(_) => {
            // Clean up old backups beyond backup_count
            let entries: Vec<_> = match fs::read_dir(parent_dir) {
                Ok(entries) => entries.filter_map(|e| e.ok()).collect(),
                Err(_) => vec![],
            };

            let mut backup_files: Vec<_> = entries
                .iter()
                .filter(|entry| {
                    entry.path().is_file()
                        && entry
                            .file_name()
                            .to_string_lossy()
                            .starts_with(&format!("backup_{}_", file_name))
                })
                .collect();

            // Sort by modified time (newest first)
            backup_files.sort_by(|a, b| {
                let a_modified = a.metadata().and_then(|m| m.modified()).unwrap_or(SystemTime::now());
                let b_modified = b.metadata().and_then(|m| m.modified()).unwrap_or(SystemTime::now());
                b_modified.cmp(&a_modified) // descending
            });

            // Remove excess backups
            for entry in backup_files.into_iter().skip(backup_count as usize) {
                let _ = fs::remove_file(entry.path());
            }

            ConfigResult {
                success: true,
                content: Some(backup_path.to_string_lossy().to_string()),
                error: None,
            }
        }
        Err(e) => ConfigResult {
            success: false,
            content: None,
            error: Some(format!("Failed to create backup: {}", e)),
        },
    }
}

// Click listening mode - get window info on click
static LISTENING_FOR_CLICK: AtomicBool = AtomicBool::new(false);

#[tauri::command]
fn start_click_listener() -> bool {
    LISTENING_FOR_CLICK.store(true, Ordering::SeqCst);
    true
}

#[tauri::command]
fn stop_click_listener() -> bool {
    LISTENING_FOR_CLICK.store(false, Ordering::SeqCst);
    true
}

#[tauri::command]
fn is_listening_for_click() -> bool {
    LISTENING_FOR_CLICK.load(Ordering::SeqCst)
}

#[tauri::command]
fn get_active_window() -> WindowInfoResult {
    // Get the currently active (focused) window
    let output = Command::new("xdotool")
        .args(["getactivewindow", "getwindowclassname"])
        .output();

    match output {
        Ok(out) if out.status.success() => {
            let class_name = String::from_utf8_lossy(&out.stdout).trim().to_lowercase();

            if !class_name.is_empty() && class_name != "(unknown)" {
                let title_output = Command::new("xdotool")
                    .args(["getactivewindow", "getwindowname"])
                    .output();

                let title = title_output
                    .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
                    .unwrap_or_default();

                let pid_output = Command::new("xdotool")
                    .args(["getactivewindow", "getwindowpid"])
                    .output();

                let pid = pid_output
                    .ok()
                    .and_then(|o| String::from_utf8_lossy(&o.stdout).trim().parse().ok());

                return WindowInfoResult {
                    success: true,
                    window: Some(WindowInfo {
                        class_name,
                        title,
                        pid,
                    }),
                    error: None,
                };
            }
        }
        _ => {}
    }

    // Try wmctrl for active window
    let output = Command::new("wmctrl").args(["-a", ":ACTIVE:"]).output();

    if output.is_ok() {
        let class_output = Command::new("xdotool")
            .args(["getactivewindow", "getwindowclassname"])
            .output();

        let class_name = class_output
            .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_lowercase())
            .unwrap_or_default();

        if !class_name.is_empty() && class_name != "(unknown)" {
            let title_output = Command::new("xdotool")
                .args(["getactivewindow", "getwindowname"])
                .output();

            let title = title_output
                .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
                .unwrap_or_default();

            return WindowInfoResult {
                success: true,
                window: Some(WindowInfo {
                    class_name,
                    title,
                    pid: None,
                }),
                error: None,
            };
        }
    }

    WindowInfoResult {
        success: false,
        window: None,
        error: Some("Не удалось получить активное окно".to_string()),
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ActiveWindow {
    pub pid: String,
    pub name: String,
    #[serde(rename = "class")]
    pub class_name: String,
    pub caption: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct InputDevice {
    pub name: String,
    pub handlers: Vec<String>,
    pub device_type: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DeviceListResult {
    pub success: bool,
    pub devices: Vec<InputDevice>,
    pub error: Option<String>,
}

fn get_home_dir() -> PathBuf {
    dirs::home_dir().unwrap_or_else(|| PathBuf::from("."))
}

fn read_temp_file(path: &str) -> String {
    fs::read_to_string(path)
        .unwrap_or_default()
        .trim()
        .to_string()
}

#[tauri::command]
fn window_detector_check_installed() -> bool {
    let home = get_home_dir();
    let kwin_script_path = home.join(KWIN_SCRIPTS_DIR).join("FocusNotifier");
    let dbus_service_path = home
        .join(DBUS_SERVICES_DIR)
        .join("scot.massie.FocusNotifier.service");
    let listener_path = home.join(BIN_DIR).join("FocusNotifierListener.sh");

    kwin_script_path.symlink_metadata().is_ok()
        && dbus_service_path.exists()
        && listener_path.exists()
}

#[tauri::command]
fn window_detector_check_service() -> bool {
    let home = get_home_dir();
    let listener_path = home.join(BIN_DIR).join("FocusNotifierListener.sh");
    let _pid_file = format!("{}/listener.pid", FOCUSNOTIFIER_VARDIR);

    if listener_path.exists() {
        let output = Command::new("pgrep")
            .args(["-f", "FocusNotifierListener.sh"])
            .output();

        if let Ok(out) = output {
            return !String::from_utf8_lossy(&out.stdout).trim().is_empty();
        }
    }

    false
}

#[tauri::command]
fn window_detector_install() -> ConfigResult {
    let home = get_home_dir();

    let kwin_dir = home.join(KWIN_SCRIPTS_DIR);
    let dbus_dir = home.join(DBUS_SERVICES_DIR);
    let bin_dir = home.join(BIN_DIR);
    let source_dir = PathBuf::from(DETECTOR_SOURCE);

    for dir in [&kwin_dir, &dbus_dir, &bin_dir] {
        if let Err(e) = fs::create_dir_all(dir) {
            return ConfigResult {
                success: false,
                content: None,
                error: Some(format!("Failed to create directory {:?}: {}", dir, e)),
            };
        }
    }

    let kwin_link = kwin_dir.join("FocusNotifier");
    if !kwin_link.exists() {
        match fs::symlink_metadata(&source_dir) {
            Ok(_) => {
                if let Err(e) = std::os::unix::fs::symlink(&source_dir, &kwin_link) {
                    return ConfigResult {
                        success: false,
                        content: None,
                        error: Some(format!("Failed to create symlink for KWin script: {}", e)),
                    };
                }
            }
            Err(e) => {
                return ConfigResult {
                    success: false,
                    content: None,
                    error: Some(format!(
                        "Source directory not found: {:?} - {}",
                        source_dir, e
                    )),
                };
            }
        }
    }

    let listener_source = source_dir.join("helpers/bashscripts/FocusNotifierListener.sh");
    let listener_dest = bin_dir.join("FocusNotifierListener.sh");
    if !listener_dest.exists() {
        if let Err(e) = fs::copy(&listener_source, &listener_dest) {
            return ConfigResult {
                success: false,
                content: None,
                error: Some(format!("Failed to copy listener: {}", e)),
            };
        }
        if let Err(e) = Command::new("chmod")
            .args(["+x", &listener_dest.to_string_lossy()])
            .output()
        {
            return ConfigResult {
                success: false,
                content: None,
                error: Some(format!("Failed to make listener executable: {:?}", e)),
            };
        }
    }

    let dbus_service_content = format!(
        "[D-BUS Service]\nName=scot.massie.FocusNotifier\nExec={}\n",
        listener_dest.to_string_lossy()
    );
    let dbus_service_path = dbus_dir.join("scot.massie.FocusNotifier.service");
    if let Err(e) = fs::write(&dbus_service_path, dbus_service_content) {
        return ConfigResult {
            success: false,
            content: None,
            error: Some(format!("Failed to write DBus service: {}", e)),
        };
    }

    let _ = Command::new("dbus-send")
        .args([
            "--session",
            "--print-reply",
            "--dest=org.freedesktop.DBus",
            "/org/freedesktop/DBus",
            "org.freedesktop.DBus.ReloadConfig",
        ])
        .output();

    let _ = Command::new("pkill")
        .args(["-f", "FocusNotifierListener.sh"])
        .output();

    std::thread::spawn(move || {
        let _ = Command::new("bash")
            .args([
                "-c",
                &format!(
                    "nohup {} > /tmp/focusnotifier.log 2>&1 &",
                    listener_dest.to_string_lossy()
                ),
            ])
            .spawn();
    });

    std::thread::sleep(std::time::Duration::from_secs(1));

    ConfigResult {
        success: true,
        content: Some("FocusNotifier installed successfully".to_string()),
        error: None,
    }
}

#[tauri::command]
fn window_detector_uninstall() -> ConfigResult {
    let home = get_home_dir();

    let _ = Command::new("pkill")
        .args(["-f", "FocusNotifierListener.sh"])
        .output();

    let kwin_link = home.join(KWIN_SCRIPTS_DIR).join("FocusNotifier");
    if kwin_link.exists() || kwin_link.symlink_metadata().is_ok() {
        let _ = fs::remove_file(&kwin_link);
    }

    let listener_path = home.join(BIN_DIR).join("FocusNotifierListener.sh");
    if listener_path.exists() {
        let _ = fs::remove_file(&listener_path);
    }

    let dbus_service_path = home
        .join(DBUS_SERVICES_DIR)
        .join("scot.massie.FocusNotifier.service");
    if dbus_service_path.exists() {
        let _ = fs::remove_file(&dbus_service_path);
    }

    let _ = Command::new("dbus-send")
        .args([
            "--session",
            "--print-reply",
            "--dest=org.freedesktop.DBus",
            "/org/freedesktop/DBus",
            "org.freedesktop.DBus.ReloadConfig",
        ])
        .output();

    ConfigResult {
        success: true,
        content: Some("FocusNotifier uninstalled".to_string()),
        error: None,
    }
}

#[tauri::command]
fn window_detector_get_active() -> ActiveWindow {
    let pid = read_temp_file(&format!("{}/pid.txt", FOCUSNOTIFIER_VARDIR));
    let name = read_temp_file(&format!("{}/wname.txt", FOCUSNOTIFIER_VARDIR));
    let class = read_temp_file(&format!("{}/wclass.txt", FOCUSNOTIFIER_VARDIR));
    let caption = read_temp_file(&format!("{}/wcaption.txt", FOCUSNOTIFIER_VARDIR));

    ActiveWindow {
        pid,
        name,
        class_name: class,
        caption,
    }
}

#[tauri::command]
fn get_input_devices() -> DeviceListResult {
    let content = match fs::read_to_string("/proc/bus/input/devices") {
        Ok(c) => c,
        Err(e) => {
            return DeviceListResult {
                success: false,
                devices: vec![],
                error: Some(format!("Failed to read /proc/bus/input/devices: {}", e)),
            };
        }
    };

    let mut devices: Vec<InputDevice> = Vec::new();
    let mut current_name = String::new();
    let mut current_handlers: Vec<String> = Vec::new();
    let mut current_ev: String = String::new();

    let system_devices = [
        "Power Button",
        "Sleep Button",
        "AT Translated",
        "Video Bus",
        "Lid Switch",
        "Power Key",
        "Intel HID events",
        "Intel HID 5 button array",
        "PC Speaker",
        "ThinkPad Extra Buttons",
        "HDA Intel",
        "HDA Digital PCBeep",
        "HDA Headphone",
        "HDA Mic",
        "Generic USB Audio",
        "USB PWC",
        "PWC PB1",
        "PWC FC3",
    ];

    let touchpad_keywords = [
        "touchpad",
        "synaptics",
        "elan",
        " Alps",
        "dll064a",
        "dll0774",
        "DELL07E6",
        "bcm5974",
        "cypress",
        "fujitsu",
        "goodix",
        "hid-over-i2c",
        "i2c-hid",
        "SYNAPT",
        "TM3276",
    ];

    let touchscreen_keywords = [
        "touchscreen",
        "digitizer",
        "Wacom",
        "Huion",
        "XP-PEN",
        "UGEE",
        "GAOMON",
        "Pen",
        "PenDisplay",
    ];

    let keyboard_keywords = [
        "keyboard",
        "Logitech K",
        "Cherry",
        "Dell KB",
        "Microsoft Keyboard",
        "Apple Keyboard",
    ];

    for line in content.lines() {
        let line = line.trim();

        if line.starts_with("I: ") {
            current_ev = String::new();
            // Extract EV= flags
            if let Some(ev_pos) = line.find("EV=") {
                let ev_end = line[ev_pos..]
                    .find(' ')
                    .map(|p| ev_pos + p)
                    .unwrap_or(line.len());
                current_ev = line[ev_pos..ev_end].to_string();
            }
        } else if line.starts_with("N: Name=") {
            // Save previous device
            if !current_name.is_empty() && !current_handlers.is_empty() {
                // Determine device type from handlers and EV flags
                let handlers_str = current_handlers.join(" ");

                let device_type = if handlers_str.contains("kbd") {
                    "keyboard".to_string()
                } else if current_ev.contains("EV_REL") && !current_ev.contains("EV_ABS") {
                    // Pure relative device - likely a mouse
                    if touchpad_keywords
                        .iter()
                        .any(|k| current_name.to_lowercase().contains(&k.to_lowercase()))
                    {
                        "touchpad".to_string()
                    } else {
                        "mouse".to_string()
                    }
                } else if current_ev.contains("EV_ABS") {
                    // Absolute device - could be touchscreen or touchpad
                    if touchscreen_keywords
                        .iter()
                        .any(|k| current_name.to_lowercase().contains(&k.to_lowercase()))
                    {
                        "touchscreen".to_string()
                    } else if touchpad_keywords
                        .iter()
                        .any(|k| current_name.to_lowercase().contains(&k.to_lowercase()))
                    {
                        "touchpad".to_string()
                    } else if handlers_str.contains("mouse") || handlers_str.contains("event") {
                        // Check if it's a tablet or touchscreen
                        if current_ev.contains("EV_KEY") && current_ev.contains("EV_ABS") {
                            // Could be wacom-style device
                            "touchscreen".to_string()
                        } else {
                            "touchpad".to_string()
                        }
                    } else {
                        "touchscreen".to_string()
                    }
                } else if current_ev.contains("EV_KEY") {
                    // Key event device - could be keyboard or gamepad
                    if keyboard_keywords
                        .iter()
                        .any(|k| current_name.to_lowercase().contains(&k.to_lowercase()))
                    {
                        "keyboard".to_string()
                    } else if handlers_str.contains("kbd") {
                        "keyboard".to_string()
                    } else {
                        // Check by name for other input devices
                        if touchpad_keywords
                            .iter()
                            .any(|k| current_name.to_lowercase().contains(&k.to_lowercase()))
                        {
                            "touchpad".to_string()
                        } else {
                            continue; // Skip unknown devices
                        }
                    }
                } else {
                    continue; // Skip devices we can't categorize
                };

                // Filter out system devices
                let is_system = system_devices.iter().any(|s| current_name.starts_with(s));

                if !is_system {
                    devices.push(InputDevice {
                        name: current_name.clone(),
                        handlers: current_handlers.clone(),
                        device_type,
                    });
                }
            }

            // Extract name
            if let Some(start) = line.find("Name=") {
                current_name = line[start + 5..].trim().to_string();
                current_name = current_name.trim_matches('"').to_string();
            }
            current_handlers = vec![];
        } else if line.starts_with("H: Handlers=") {
            // Extract handlers
            if let Some(start) = line.find("Handlers=") {
                let handlers_str = &line[start + 9..];
                current_handlers = handlers_str
                    .split_whitespace()
                    .map(|s| s.to_string())
                    .collect();
            }
        }
    }

    // Sort by type then name
    devices.sort_by(|a, b| match a.device_type.cmp(&b.device_type) {
        std::cmp::Ordering::Equal => a.name.cmp(&b.name),
        other => other,
    });

    DeviceListResult {
        success: true,
        devices,
        error: None,
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_config_path,
            read_config,
            write_config,
            get_gui_config_path,
            read_gui_config,
            write_gui_config,
            create_config_backup,
            start_click_listener,
            stop_click_listener,
            is_listening_for_click,
            get_active_window,
            window_detector_check_installed,
            window_detector_check_service,
            window_detector_install,
            window_detector_uninstall,
            window_detector_get_active,
            get_input_devices
        ])
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();
            window.set_title("Input Action Configurator").unwrap();
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
