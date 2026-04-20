import { invoke } from '@tauri-apps/api/core'
import { ref } from 'vue'

export interface ActiveWindow {
  pid: string
  name: string
  class: string
  caption: string
}

export interface WindowDetectorResult {
  success: boolean
  error: string | null
}

const _isInstalled = ref(false)
const _isServiceRunning = ref(false)

export function useWindowDetector() {
  const checkInstalled = async (): Promise<boolean> => {
    try {
      const result = await invoke<{ installed: boolean }>('window_detector_check_installed')
      _isInstalled.value = result.installed
      return result.installed
    } catch {
      return false
    }
  }

  const checkServiceRunning = async (): Promise<boolean> => {
    try {
      const result = await invoke<{ running: boolean }>('window_detector_check_service')
      _isServiceRunning.value = result.running
      return result.running
    } catch {
      return false
    }
  }

  const install = async (): Promise<WindowDetectorResult> => {
    try {
      const result = await invoke<WindowDetectorResult>('window_detector_install')
      if (result.success) {
        _isInstalled.value = true
      }
      return result
    } catch (e) {
      return { success: false, error: String(e) }
    }
  }

  const uninstall = async (): Promise<WindowDetectorResult> => {
    try {
      const result = await invoke<WindowDetectorResult>('window_detector_uninstall')
      if (result.success) {
        _isInstalled.value = false
        _isServiceRunning.value = false
      }
      return result
    } catch (e) {
      return { success: false, error: String(e) }
    }
  }

  const getActiveWindow = async (): Promise<ActiveWindow> => {
    try {
      const result = await invoke<ActiveWindow>('window_detector_get_active')
      return result
    } catch (e) {
      return {
        pid: '',
        name: '',
        class: '',
        caption: '',
      }
    }
  }

  return {
    isInstalled: _isInstalled,
    isServiceRunning: _isServiceRunning,
    checkInstalled,
    checkServiceRunning,
    install,
    uninstall,
    getActiveWindow,
  }
}

export async function getActiveWindow(): Promise<ActiveWindow> {
  try {
    return await invoke<ActiveWindow>('window_detector_get_active')
  } catch {
    return { pid: '', name: '', class: '', caption: '' }
  }
}

export async function checkInstalled(): Promise<boolean> {
  try {
    return await invoke<boolean>('window_detector_check_installed')
  } catch {
    return false
  }
}

export async function checkServiceRunning(): Promise<boolean> {
  try {
    return await invoke<boolean>('window_detector_check_service')
  } catch {
    return false
  }
}

export async function installDetector(): Promise<WindowDetectorResult> {
  return await invoke<WindowDetectorResult>('window_detector_install')
}

export async function uninstallDetector(): Promise<WindowDetectorResult> {
  return await invoke<WindowDetectorResult>('window_detector_uninstall')
}
