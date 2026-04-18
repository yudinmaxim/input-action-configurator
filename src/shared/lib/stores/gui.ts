import { reactive, computed } from 'vue'
import { readGuiConfig, writeGuiConfig, type ConfigResult } from '../../api/config'

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
  configFilePath: null, // Will be set to default in configStore if null
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
          // Merge with defaults using Object.assign to preserve reactivity
          Object.assign(state.settings, { ...defaultSettings, ...parsed })
          state.isDirty = false
        } catch (parseError) {
          console.warn('Failed to parse GUI config, using defaults:', parseError)
          Object.assign(state.settings, defaultSettings)
        }
      } else {
        // No config file or error, use defaults
        Object.assign(state.settings, defaultSettings)
      }
      return result
    } catch (e) {
      console.warn('Cannot load GUI config (Tauri not running?):', e)
      Object.assign(state.settings, defaultSettings)
      return { success: false, content: null, error: String(e) }
    } finally {
      state.isLoading = false
    }
  }

  const saveToFile = async (): Promise<ConfigResult> => {
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
    Object.assign(state.settings, defaultSettings)
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