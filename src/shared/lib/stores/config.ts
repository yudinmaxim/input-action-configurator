import { reactive, computed } from 'vue'
import yaml from 'js-yaml'
import { 
  DeviceType, 
  TriggerType, 
  SwipeDirection,
  CircleDirection,
  TriggerEvent,
  InputActionsConfig,
  MouseButton,
  TRIGGERS_BY_DEVICE,
  TRIGGER_EVENTS,
  TriggerConfig
} from '../types'
import { readConfig, writeConfig, type ConfigResult } from '../../api/config'

const initialConfig = {
  device: {
    touchpad: [
      {
        type: TriggerType.SWIPE,
        id: 'touchpad-swipe-3-right',
        direction: SwipeDirection.RIGHT,
        fingers: 3,
        actions: [
          {
            on: TriggerEvent.BEGIN,
            command: 'notify-send "3-finger swipe right"'
          }
        ]
      },
      {
        type: TriggerType.SWIPE,
        id: 'touchpad-swipe-3-left',
        direction: SwipeDirection.LEFT,
        fingers: 3,
        actions: [
          {
            on: TriggerEvent.BEGIN,
            command: 'notify-send "3-finger swipe left"'
          }
        ]
      },
      {
        type: TriggerType.SWIPE,
        id: 'touchpad-swipe-3-up',
        direction: SwipeDirection.UP,
        fingers: 3,
        actions: [
          {
            on: TriggerEvent.BEGIN,
            command: 'notify-send "3-finger swipe up"'
          }
        ]
      },
      {
        type: TriggerType.SWIPE,
        id: 'touchpad-swipe-3-down',
        direction: SwipeDirection.DOWN,
        fingers: 3,
        actions: [
          {
            on: TriggerEvent.BEGIN,
            command: 'notify-send "3-finger swipe down"'
          }
        ]
      }
    ],
    mouse: [
      {
        type: TriggerType.SWIPE,
        id: 'mouse-swipe-right',
        direction: SwipeDirection.RIGHT,
        mouse_buttons: [MouseButton.RIGHT],
        actions: [
          {
            on: TriggerEvent.BEGIN,
            input: [
              {
                keyboard: ['alt+tab']
              }
            ]
          }
        ]
      }
    ]
  },
  device_rules: [],
  settings: {}
}

const state = reactive({
  config: JSON.parse(JSON.stringify(initialConfig)) as InputActionsConfig,
  selectedDevice: DeviceType.TOUCHPAD as DeviceType | null,
  selectedTriggerId: null as string | null,
  isDirty: false
})

export const useConfigStore = () => {
  const devices = computed(() => {
    const result: { type: DeviceType; triggers: any[] }[] = []
    
    if (state.config.device?.keyboard) {
      result.push({ type: DeviceType.KEYBOARD, triggers: state.config.device.keyboard })
    }
    if (state.config.device?.mouse) {
      result.push({ type: DeviceType.MOUSE, triggers: state.config.device.mouse })
    }
    if (state.config.device?.touchpad) {
      result.push({ type: DeviceType.TOUCHPAD, triggers: state.config.device.touchpad })
    }
    if (state.config.device?.touchscreen) {
      result.push({ type: DeviceType.TOUCHSCREEN, triggers: state.config.device.touchscreen })
    }
    
    return result
  })
  
  const selectedTrigger = computed<TriggerConfig | null>(() => {
    if (!state.selectedDevice || !state.selectedTriggerId) return null
    
    const deviceConfig = state.config.device?.[state.selectedDevice]
    if (!deviceConfig) return null
    
    const trigger = deviceConfig.find((t: any) => t.id === state.selectedTriggerId)
    if (!trigger) return null
    
    return trigger as TriggerConfig
  })
  
  const availableTriggers = computed(() => {
    if (!state.selectedDevice) return []
    return TRIGGERS_BY_DEVICE[state.selectedDevice] || []
  })
  
  const availableEvents = computed(() => {
    if (!selectedTrigger.value) return []
    return TRIGGER_EVENTS[selectedTrigger.value.type as TriggerType] || []
  })
  
  const setSelectedDevice = (device: DeviceType | null) => {
    state.selectedDevice = device
    state.selectedTriggerId = null
  }
  
  const setSelectedTrigger = (id: string | null) => {
    state.selectedTriggerId = id
  }
  
  const addTrigger = (deviceType: DeviceType, trigger: TriggerConfig) => {
    if (!state.config.device) {
      state.config.device = {} as any
    }
    if (!state.config.device![deviceType]) {
      state.config.device![deviceType] = [] as any[]
    }
    ;(state.config.device![deviceType] as any[]).push(trigger)
    state.selectedTriggerId = trigger.id ?? null
    state.isDirty = true
  }
  
  const updateTrigger = (deviceType: DeviceType, triggerId: string, updates: any) => {
    const triggers = state.config.device?.[deviceType]
    if (!triggers) return
    
    const index = triggers.findIndex((t: any) => t.id === triggerId)
    if (index !== -1) {
      triggers[index] = { ...triggers[index], ...updates }
      state.isDirty = true
    }
  }
  
  const deleteTrigger = (deviceType: DeviceType, triggerId: string) => {
    const triggers = state.config.device?.[deviceType]
    if (!triggers) return
    
    const index = triggers.findIndex((t: any) => t.id === triggerId)
    if (index !== -1) {
      triggers.splice(index, 1)
      if (state.selectedTriggerId === triggerId) {
        state.selectedTriggerId = null
      }
      state.isDirty = true
    }
  }
  
  const addAction = (deviceType: DeviceType, triggerId: string, action: any) => {
    const triggers = state.config.device?.[deviceType]
    if (!triggers) return
    
    const trigger = triggers.find((t: any) => t.id === triggerId)
    if (trigger) {
      if (!trigger.actions) trigger.actions = []
      trigger.actions.push(action)
      state.isDirty = true
    }
  }
  
  const updateAction = (deviceType: DeviceType, triggerId: string, actionIndex: number, updates: any) => {
    const triggers = state.config.device?.[deviceType]
    if (!triggers) return
    
    const trigger = triggers.find((t: any) => t.id === triggerId)
    if (trigger?.actions?.[actionIndex]) {
      trigger.actions[actionIndex] = { ...trigger.actions[actionIndex], ...updates }
      state.isDirty = true
    }
  }
  
  const deleteAction = (deviceType: DeviceType, triggerId: string, actionIndex: number) => {
    const triggers = state.config.device?.[deviceType]
    if (!triggers) return
    
    const trigger = triggers.find((t: any) => t.id === triggerId)
    if (trigger?.actions) {
      trigger.actions.splice(actionIndex, 1)
      state.isDirty = true
    }
  }
  
  const getConfig = () => JSON.parse(JSON.stringify(state.config))
  
  const loadConfig = (config: InputActionsConfig) => {
    state.config = JSON.parse(JSON.stringify(config))
    state.isDirty = false
  }
  
  const loadFromFile = async (): Promise<ConfigResult> => {
    try {
      const result = await readConfig()
      if (result.success && result.content) {
        const parsed = yaml.load(result.content)
        if (parsed && typeof parsed === 'object') {
          loadConfig(parsed as InputActionsConfig)
        }
      }
      return result
    } catch (e) {
      return { success: false, content: null, error: String(e) }
    }
  }
  
  const saveToFile = async (): Promise<ConfigResult> => {
    try {
      const configYaml = yaml.dump(state.config, { lineWidth: -1, noRefs: true })
      const result = await writeConfig(configYaml)
      if (result.success) {
        state.isDirty = false
      }
      return result
    } catch (e) {
      return { success: false, content: null, error: String(e) }
    }
  }
  
  return {
    state,
    devices,
    selectedTrigger,
    availableTriggers,
    availableEvents,
    setSelectedDevice,
    setSelectedTrigger,
    addTrigger,
    updateTrigger,
    deleteTrigger,
    addAction,
    updateAction,
    deleteAction,
    getConfig,
    loadConfig,
    loadFromFile,
    saveToFile
  }
}

export const DeviceTypeOptions = [
  { value: DeviceType.KEYBOARD, label: 'Keyboard' },
  { value: DeviceType.MOUSE, label: 'Mouse' },
  { value: DeviceType.TOUCHPAD, label: 'Touchpad' },
  { value: DeviceType.TOUCHSCREEN, label: 'Touchscreen' }
]

export const TriggerTypeOptions = [
  { value: TriggerType.SWIPE, label: 'Swipe' },
  { value: TriggerType.CIRCLE, label: 'Circle' },
  { value: TriggerType.HOLD, label: 'Hold' },
  { value: TriggerType.TAP, label: 'Tap' },
  { value: TriggerType.CLICK, label: 'Click' },
  { value: TriggerType.STROKE, label: 'Stroke' },
  { value: TriggerType.PINCH, label: 'Pinch' },
  { value: TriggerType.ROTATE, label: 'Rotate' },
  { value: TriggerType.WHEEL, label: 'Wheel' },
  { value: TriggerType.PRESS, label: 'Press' },
  { value: TriggerType.SHORTCUT, label: 'Shortcut' }
]

export const SwipeDirectionOptions = [
  { value: SwipeDirection.LEFT, label: 'Left' },
  { value: SwipeDirection.RIGHT, label: 'Right' },
  { value: SwipeDirection.UP, label: 'Up' },
  { value: SwipeDirection.DOWN, label: 'Down' },
  { value: SwipeDirection.LEFT_RIGHT, label: 'Left/Right (bidirectional)' },
  { value: SwipeDirection.UP_DOWN, label: 'Up/Down (bidirectional)' },
  { value: SwipeDirection.LEFT_UP, label: 'Left Up (diagonal)' },
  { value: SwipeDirection.LEFT_DOWN, label: 'Left Down (diagonal)' },
  { value: SwipeDirection.RIGHT_UP, label: 'Right Up (diagonal)' },
  { value: SwipeDirection.RIGHT_DOWN, label: 'Right Down (diagonal)' },
  { value: SwipeDirection.LEFT_UP_RIGHT_DOWN, label: 'Bidirectional diagonal' },
  { value: SwipeDirection.LEFT_DOWN_RIGHT_UP, label: 'Bidirectional diagonal' },
  { value: SwipeDirection.ANY, label: 'Any direction' }
]

export const CircleDirectionOptions = [
  { value: CircleDirection.CLOCKWISE, label: 'Clockwise' },
  { value: CircleDirection.COUNTERCLOCKWISE, label: 'Counter-clockwise' },
  { value: CircleDirection.ANY, label: 'Any direction' }
]

export const TriggerEventOptions = [
  { value: TriggerEvent.BEGIN, label: 'Begin (when gesture starts)' },
  { value: TriggerEvent.UPDATE, label: 'Update (during gesture)' },
  { value: TriggerEvent.TICK, label: 'Tick (time-based)' },
  { value: TriggerEvent.END, label: 'End (when gesture completes)' },
  { value: TriggerEvent.CANCEL, label: 'Cancel (when gesture cancelled)' },
  { value: TriggerEvent.END_CANCEL, label: 'End Cancel (end after cancel)' }
]

export const MouseButtonOptions = [
  { value: MouseButton.LEFT, label: 'Left Button' },
  { value: MouseButton.MIDDLE, label: 'Middle Button' },
  { value: MouseButton.RIGHT, label: 'Right Button' },
  { value: MouseButton.BACK, label: 'Back Button' },
  { value: MouseButton.FORWARD, label: 'Forward Button' },
  { value: MouseButton.EXTRA1, label: 'Extra 1' },
  { value: MouseButton.EXTRA2, label: 'Extra 2' }
]

export { DeviceType, TriggerType, TriggerEvent }