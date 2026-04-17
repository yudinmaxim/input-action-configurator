import { reactive, computed } from 'vue'
import { readGuiConfig, writeGuiConfig, getConfigPath, type ConfigResult } from '../../api/config'

export interface GuiSettings {
  version: string
  configFilePath: string | null
  triggerListWidth: number
  selectedDevice: string | null
  selectedTriggerId: string | null
  showConfigPreview: boolean
  enableBackups: boolean
  backupCount: number
  windowState?: {
    width: number
    height: number
    x: number
    y: number
    maximized: boolean
  }
}

const defaultSettings: GuiSettings = {
  version: '1.0',
  configFilePath: null,
  triggerListWidth: 300,
  selectedDevice: null,
  selectedTriggerId: null,
  showConfigPreview: false,
  enableBackups: true,
  backupCount: 5,
  windowState: undefined
}

const state = reactive({
  settings: { ...defaultSettings } as GuiSettings,
  isDirty: false,
  isLoading: false
})

export const useGuiStore = () => {
  const settings = computed(() => state.settings)
  const isDirty = computed(() => state.isDirty)
  const isLoading = computed(() => state.isLoading)

  const updateSettings = (updates: Partial<GuiSettings>) => {
    Object.assign(state.settings, updates)
    state.isDirty = true
  }

  const setTriggerListWidth = (width: number) => {
    if (state.settings.triggerListWidth !== width) {
      state.settings.triggerListWidth = width
      state.isDirty = true
    }
  }

  const setSelectedDevice = (device: string | null) => {
    if (state.settings.selectedDevice !== device) {
      state.settings.selectedDevice = device
      state.isDirty = true
    }
  }

  const setSelectedTriggerId = (id: string | null) => {
    if (state.settings.selectedTriggerId !== id) {
      state.settings.selectedTriggerId = id
      state.isDirty = true
    }
  }

  const setShowConfigPreview = (show: boolean) => {
    if (state.settings.showConfigPreview !== show) {
      state.settings.showConfigPreview = show
      state.isDirty = true
    }
  }

  const setWindowState = (windowState: GuiSettings['windowState']) => {
    state.settings.windowState = windowState
    state.isDirty = true
  }

  const setConfigFilePath = (path: string | null) => {
    if (state.settings.configFilePath !== path) {
      state.settings.configFilePath = path
      state.isDirty = true
    }
  }

  const loadFromFile = async (): Promise<ConfigResult> => {
    state.isLoading = true
    try {
      const result = await readGuiConfig()
      if (result.success && result.content) {
        try {
          const parsed = JSON.parse(result.content)
          // Merge with defaults, preserving any new fields
          state.settings = { ...defaultSettings, ...parsed }
          state.isDirty = false

          // Check if loaded config file path matches current config
          try {
            const currentConfigPath = await getConfigPath()
            if (state.settings.configFilePath !== currentConfigPath) {
              // GUI settings belong to a different config file, reset device/trigger selection
              state.settings.selectedDevice = null
              state.settings.selectedTriggerId = null
              state.isDirty = true
            }
          } catch (e) {
            console.warn('Cannot get current config path:', e)
          }
        } catch (parseError) {
          console.warn('Failed to parse GUI config, using defaults:', parseError)
          state.settings = { ...defaultSettings }
        }
      } else {
        // No config file or error, use defaults
        state.settings = { ...defaultSettings }
      }
      return result
    } catch (e) {
      console.warn('Cannot load GUI config (Tauri not running?):', e)
      state.settings = { ...defaultSettings }
      return { success: false, content: null, error: String(e) }
    } finally {
      state.isLoading = false
    }
  }

  const saveToFile = async (): Promise<ConfigResult> => {
    // Update config file path before saving
    try {
      const currentConfigPath = await getConfigPath()
      setConfigFilePath(currentConfigPath)
    } catch (e) {
      console.warn('Cannot get current config path:', e)
    }

    if (!state.isDirty) {
      return { success: true, content: null, error: null }
    }
    try {
      const content = JSON.stringify(state.settings, null, 2)
      const result = await writeGuiConfig(content)
      if (result.success) {
        state.isDirty = false
      }
      return result
    } catch (e) {
      console.warn('Cannot save GUI config:', e)
      return { success: false, content: null, error: String(e) }
    }
  }

  const resetToDefaults = () => {
    state.settings = { ...defaultSettings }
    state.isDirty = true
  }

  return {
    state,
    settings,
    isDirty,
    isLoading,
    updateSettings,
    setTriggerListWidth,
    setSelectedDevice,
    setSelectedTriggerId,
    setShowConfigPreview,
    setWindowState,
    setConfigFilePath,
    loadFromFile,
    saveToFile,
    resetToDefaults
  }
}