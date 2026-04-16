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

export interface WindowListResult {
  success: boolean
  windows: WindowInfo[]
  error: string | null
}

export interface WindowInfoResult {
  success: boolean
  window: WindowInfo | null
  error: string | null
}

export async function getConfigPath(): Promise<string> {
  return await invoke('get_config_path')
}

export async function readConfig(): Promise<ConfigResult> {
  return await invoke('read_config')
}

export async function writeConfig(content: string): Promise<ConfigResult> {
  return await invoke('write_config', { content })
}

export async function getWindowList(): Promise<WindowListResult> {
  return await invoke('get_window_list')
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

export async function getWindowAtMouse(): Promise<WindowInfoResult> {
  return await invoke('get_window_at_mouse')
}

export async function getActiveWindow(): Promise<WindowInfoResult> {
  return await invoke('get_active_window')
}