import { dump, load } from 'js-yaml'
import type { InputActionsConfig, DeviceConfig, TriggerConfig } from './types'
import { DeviceType, TriggerType, SwipeDirection, CircleDirection, TriggerEvent, MouseButton } from './types'

/**
 * Конвертация из формата файла inputactions во внутренний формат
 */
function normalizeDeviceRules(rules: any[]): any[] {
  return rules.map((rule: any) => {
    const normalized = { ...rule }
    
    // Conditions может быть строкой или массивом
    if (typeof rule.conditions === 'string') {
      normalized.conditions = [rule.conditions]
    } else if (Array.isArray(rule.conditions)) {
      // Каждое условие может быть строкой или объектом
      normalized.conditions = rule.conditions.map((c: any) => 
        typeof c === 'string' ? c : c
      )
    } else if (!rule.conditions) {
      normalized.conditions = []
    }
    
    return normalized
  })
}

export function parseInputActionsConfig(yamlContent: string): InputActionsConfig {
  const raw = load(yamlContent) as any
  
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid config format: root must be an object')
  }

  const config: InputActionsConfig = {
    device: {},
    device_rules: normalizeDeviceRules(raw.device_rules || []),
    settings: raw.settings || {}
  }

  // Конвертация устройств
  for (const deviceKey of ['touchpad', 'mouse', 'keyboard', 'touchscreen']) {
    const deviceRaw = raw[deviceKey]
    if (!deviceRaw) continue

    const deviceType = deviceKey as DeviceType
    const gestures = deviceRaw.gestures || []

    // Если есть поле gestures, конвертируем его
    if (Array.isArray(gestures)) {
      const triggers: TriggerConfig[] = gestures.map((gesture: any, index: number) => {
        return convertGestureToTrigger(gesture, deviceType, index)
      })
      config.device![deviceType] = triggers
    }
    // Если это плоский массив (старый формат)
    else if (Array.isArray(deviceRaw)) {
      config.device![deviceType] = deviceRaw as TriggerConfig[]
    }
    // Если это объект с другими полями
    else if (typeof deviceRaw === 'object') {
      // Проверяем, есть ли там триггеры в виде массива
      for (const [key, value] of Object.entries(deviceRaw)) {
        if (Array.isArray(value) && value.length > 0 && value[0].type) {
          config.device![deviceType] = value as TriggerConfig[]
          break
        }
      }
    }
  }

  return config
}

/**
 * Конвертация gesture в trigger
 */
function convertGestureToTrigger(gesture: any, deviceType: DeviceType, index: number): TriggerConfig {
  const trigger: TriggerConfig = {
    type: gesture.type as TriggerType,
    id: gesture.id || `${deviceType}-${gesture.type}-${index}`,
    actions: (gesture.actions || []).map((action: any) => ({
      on: action.on as TriggerEvent,
      ...convertActionInput(action.input)
    }))
  }

  // Конвертация специфичных полей
  if (gesture.direction !== undefined) {
    trigger.direction = convertDirection(gesture.direction)
  }

  if (gesture.fingers !== undefined) {
    trigger.fingers = gesture.fingers
  }

  if (gesture.mouse_buttons !== undefined) {
    trigger.mouse_buttons = gesture.mouse_buttons.map((b: string | number) => 
      typeof b === 'string' ? MouseButton[b.toUpperCase() as keyof typeof MouseButton] : b
    )
  }

  if (gesture.conditions) {
    trigger.conditions = gesture.conditions
  }

  if (gesture.resume_timeout !== undefined) {
    trigger.resume_timeout = gesture.resume_timeout
  }

  if (gesture.block_events !== undefined) {
    trigger.block_events = gesture.block_events
  }

  // Circle specific
  if (gesture.circle_direction !== undefined) {
    trigger.circle_direction = convertCircleDirection(gesture.circle_direction)
  }

  return trigger
}

/**
 * Конвертация input action
 * Формат YAML: input: [{ mouse: ['+middle'] }, { keyboard: ['+ctrl'] }]
 */
function convertActionInput(input: any): any {
  if (!input) return {}
  
  const result: any = { input: [] }
  
  if (Array.isArray(input)) {
    for (const item of input) {
      if (item && typeof item === 'object') {
        // YAML парсит как: - mouse: [+middle]
        // или: - keyboard: [+ctrl]
        for (const [key, value] of Object.entries(item)) {
          if (key === 'mouse' || key === 'keyboard') {
            result.input.push({ [key]: value })
          }
        }
      }
    }
  }
  
  if (result.input.length === 0) {
    delete result.input
  }
  
  return result
}

/**
 * Конвертация направления свайпа
 */
function convertDirection(dir: string): number {
  const dirMap: Record<string, number> = {
    'any': SwipeDirection.ANY,
    'left': SwipeDirection.LEFT,
    'right': SwipeDirection.RIGHT,
    'up': SwipeDirection.UP,
    'down': SwipeDirection.DOWN,
    'left_right': SwipeDirection.LEFT_RIGHT,
    'up_down': SwipeDirection.UP_DOWN,
    'left_up': SwipeDirection.LEFT_UP,
    'left_down': SwipeDirection.LEFT_DOWN,
    'right_up': SwipeDirection.RIGHT_UP,
    'right_down': SwipeDirection.RIGHT_DOWN,
    'left_up_right_down': SwipeDirection.LEFT_UP_RIGHT_DOWN,
    'left_down_right_up': SwipeDirection.LEFT_DOWN_RIGHT_UP
  }
  return dirMap[dir] ?? SwipeDirection.ANY
}

/**
 * Конвертация направления круга
 */
function convertCircleDirection(dir: string): number {
  const dirMap: Record<string, number> = {
    'any': CircleDirection.ANY,
    'clockwise': CircleDirection.CLOCKWISE,
    'counter-clockwise': CircleDirection.COUNTERCLOCKWISE
  }
  return dirMap[dir] ?? CircleDirection.ANY
}

/**
 * Конвертация из внутреннего формата в формат файла inputactions
 */
export function dumpInputActionsConfig(config: InputActionsConfig): string {
  const output: any = {
    device_rules: config.device_rules || [],
    settings: config.settings || {}
  }

  // Конвертация устройств
  for (const deviceKey of ['touchpad', 'mouse', 'keyboard', 'touchscreen']) {
    const deviceType = deviceKey as DeviceType
    const triggers = config.device?.[deviceType]

    if (triggers && triggers.length > 0) {
      output[deviceKey] = {
        gestures: triggers.map(trigger => convertTriggerToGesture(trigger, deviceType))
      }
    }
  }

  let yaml = dump(output, { lineWidth: -1, noRefs: true, indent: 2 })
  
  // Убираем кавычки с 'on' (YAML парсит on как зарезервированное слово)
  yaml = yaml.replace(/['"]on['"]\s*:/g, 'on:')
  
  return yaml
}

/**
 * Конвертация trigger в gesture
 */
function convertTriggerToGesture(trigger: TriggerConfig, deviceType: DeviceType): any {
  const gesture: any = {
    type: trigger.type,
    id: trigger.id,
    actions: trigger.actions?.map(action => {
      // action.input это массив [{ mouse: [...] }, { keyboard: [...] }]
      const inputActions: any[] = []
      if (action.input && Array.isArray(action.input)) {
        for (const item of action.input) {
          if (item.mouse) {
            inputActions.push({ mouse: item.mouse })
          }
          if (item.keyboard) {
            inputActions.push({ keyboard: item.keyboard })
          }
        }
      }
      return {
        on: action.on,
        ...(inputActions.length > 0 ? { input: inputActions } : {})
      }
    })
  }

  // Специфичные поля
  if (trigger.direction !== undefined) {
    gesture.direction = convertDirectionToString(trigger.direction)
  }

  if (trigger.fingers !== undefined) {
    gesture.fingers = trigger.fingers
  }

  if (trigger.mouse_buttons) {
    gesture.mouse_buttons = trigger.mouse_buttons
  }

  if (trigger.conditions) {
    gesture.conditions = trigger.conditions
  }

  if (trigger.resume_timeout !== undefined) {
    gesture.resume_timeout = trigger.resume_timeout
  }

  if (trigger.block_events !== undefined) {
    gesture.block_events = trigger.block_events
  }

  if (trigger.circle_direction !== undefined) {
    gesture.circle_direction = convertCircleDirectionToString(trigger.circle_direction)
  }

  // Убираем undefined поля
  Object.keys(gesture).forEach(key => {
    if (gesture[key] === undefined) {
      delete gesture[key]
    }
  })

  return gesture
}

/**
 * Конвертация направления в строку
 */
function convertDirectionToString(dir: number): string {
  const dirMap: Record<number, string> = {
    [SwipeDirection.ANY]: 'any',
    [SwipeDirection.LEFT]: 'left',
    [SwipeDirection.RIGHT]: 'right',
    [SwipeDirection.UP]: 'up',
    [SwipeDirection.DOWN]: 'down',
    [SwipeDirection.LEFT_RIGHT]: 'left_right',
    [SwipeDirection.UP_DOWN]: 'up_down',
    [SwipeDirection.LEFT_UP]: 'left_up',
    [SwipeDirection.LEFT_DOWN]: 'left_down',
    [SwipeDirection.RIGHT_UP]: 'right_up',
    [SwipeDirection.RIGHT_DOWN]: 'right_down',
    [SwipeDirection.LEFT_UP_RIGHT_DOWN]: 'left_up_right_down',
    [SwipeDirection.LEFT_DOWN_RIGHT_UP]: 'left_down_right_up'
  }
  return dirMap[dir] ?? 'any'
}

/**
 * Конвертация направления круга в строку
 */
function convertCircleDirectionToString(dir: number): string {
  const dirMap: Record<number, string> = {
    [CircleDirection.ANY]: 'any',
    [CircleDirection.CLOCKWISE]: 'clockwise',
    [CircleDirection.COUNTERCLOCKWISE]: 'counter-clockwise'
  }
  return dirMap[dir] ?? 'any'
}
