import { invoke } from '@tauri-apps/api/core'

export interface ConfigResult {
  success: boolean
  content: string | null
  error: string | null
}

export interface WindowInfo {
  title: string
  class_name: string
  pid: number | null
}

export interface WindowInfoResult {
  success: boolean
  window: WindowInfo | null
  error: string | null
}

export async function getConfigPath(): Promise<string> {
  return await invoke('get_config_path')
}

export async function readConfig(configPath?: string): Promise<ConfigResult> {
  return await invoke('read_config', { configPath })
}

export async function writeConfig(content: string, configPath?: string): Promise<ConfigResult> {
  return await invoke('write_config', { content, configPath })
}

export async function startClickListener(): Promise<boolean> {
  return await invoke('start_click_listener')
}

export async function stopClickListener(): Promise<boolean> {
  return await invoke('stop_click_listener')
}

export async function isListeningForClick(): Promise<boolean> {
  return await invoke('is_listening_for_click')
}

export async function getActiveWindow(): Promise<WindowInfoResult> {
  return await invoke('get_active_window')
}

export type DeviceCategory = 'keyboard' | 'mouse' | 'touchpad' | 'touchscreen'

export interface InputDevice {
  name: string
  handlers: string[]
  device_type: DeviceCategory
}

export interface DeviceListResult {
  success: boolean
  devices: InputDevice[]
  error: string | null
}

export async function getInputDevices(): Promise<DeviceListResult> {
  return await invoke('get_input_devices')
}

export async function getGuiConfigPath(): Promise<string> {
  return await invoke('get_gui_config_path')
}

export async function readGuiConfig(): Promise<ConfigResult> {
  return await invoke('read_gui_config')
}

export async function writeGuiConfig(content: string): Promise<ConfigResult> {
  return await invoke('write_gui_config', { content })
}

export async function createConfigBackup(configPath: string, backupCount: number): Promise<ConfigResult> {
  return await invoke('create_config_backup', { configPath, backupCount })
}