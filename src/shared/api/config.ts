import { invoke } from '@tauri-apps/api/core'

export interface ConfigResult {
  success: boolean
  content: string | null
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