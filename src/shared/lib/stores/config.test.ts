import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useConfigStore } from './config'
import { DeviceType, TriggerType, TriggerEvent, TriggerConfig } from '../types'

// Mock Tauri API
vi.mock('../../api/config', () => ({
  readConfig: vi.fn().mockResolvedValue({ success: true, content: 'device_rules: []', error: null }),
  writeConfig: vi.fn().mockResolvedValue({ success: true, content: null, error: null })
}))

describe('useConfigStore', () => {
  let store: ReturnType<typeof useConfigStore>

  beforeEach(() => {
    // Создаем новый store для каждого теста
    store = useConfigStore()
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('должен иметь начальное состояние с mock данными', () => {
      expect(store.state.config.device).toBeDefined()
      expect(store.state.config.device?.touchpad).toHaveLength(4)
      expect(store.state.config.device?.mouse).toHaveLength(1)
      expect(store.state.selectedDevice).toBe(DeviceType.TOUCHPAD)
      expect(store.state.isDirty).toBe(false)
    })

    it('должен иметь computed devices с устройствами, у которых есть триггеры', () => {
      const devices = store.devices.value
      expect(devices.length).toBeGreaterThanOrEqual(2)
      const deviceTypes = devices.map(d => d.type)
      expect(deviceTypes).toContain(DeviceType.TOUCHPAD)
      expect(deviceTypes).toContain(DeviceType.MOUSE)
    })
  })

  describe('select operations', () => {
    it('должен устанавливать выбранное устройство', () => {
      store.setSelectedDevice(DeviceType.MOUSE)
      expect(store.state.selectedDevice).toBe(DeviceType.MOUSE)
    })

    it('должен сбрасывать выбранный триггер при смене устройства', () => {
      store.state.selectedTriggerId = 'test-id'
      store.setSelectedDevice(DeviceType.MOUSE)
      expect(store.state.selectedTriggerId).toBeNull()
    })

    it('должен устанавливать выбранный триггер', () => {
      store.setSelectedTrigger('test-trigger-id')
      expect(store.state.selectedTriggerId).toBe('test-trigger-id')
    })

    it('должен возвращать selectedTrigger для существующего триггера', () => {
      store.state.selectedDevice = DeviceType.TOUCHPAD
      store.state.selectedTriggerId = 'touchpad-swipe-3-right'
      
      const trigger = store.selectedTrigger.value
      expect(trigger).toBeDefined()
      expect(trigger?.id).toBe('touchpad-swipe-3-right')
      expect(trigger?.type).toBe(TriggerType.SWIPE)
    })

    it('должен возвращать null для несуществующего триггера', () => {
      store.state.selectedDevice = DeviceType.TOUCHPAD
      store.state.selectedTriggerId = 'non-existent-id'
      
      expect(store.selectedTrigger.value).toBeNull()
    })
  })

  describe('trigger CRUD operations', () => {
    it('должен добавлять новый триггер', () => {
      const newTrigger: TriggerConfig = {
        type: TriggerType.TAP,
        id: 'new-tap-trigger',
        fingers: 2,
        actions: [
          {
            on: TriggerEvent.BEGIN,
            input: [{ keyboard: ['+ctrl'] }]
          }
        ]
      }

      store.addTrigger(DeviceType.TOUCHPAD, newTrigger)

      const triggers = store.state.config.device?.touchpad
      expect(triggers).toHaveLength(5) // было 4, стало 5
      expect(triggers?.find(t => t.id === 'new-tap-trigger')).toBeDefined()
      expect(store.state.isDirty).toBe(true)
    })

    it('должен дублировать существующий триггер', () => {
      const initialLength = store.state.config.device?.touchpad?.length || 0
      
      store.duplicateTrigger(DeviceType.TOUCHPAD, 'touchpad-swipe-3-right')
      
      const triggers = store.state.config.device?.touchpad
      expect(triggers).toHaveLength(initialLength + 1)
      expect(triggers?.find(t => t.id === 'touchpad-swipe-3-right-copy')).toBeDefined()
      expect(store.state.isDirty).toBe(true)
    })

    it('должен обновлять триггер', () => {
      store.updateTrigger(DeviceType.TOUCHPAD, 'touchpad-swipe-3-right', {
        fingers: 4
      })

      const trigger = store.state.config.device?.touchpad?.find(
        (t: any) => t.id === 'touchpad-swipe-3-right'
      )
      expect(trigger?.fingers).toBe(4)
      expect(store.state.isDirty).toBe(true)
    })

    it('должен удалять триггер', () => {
      const initialLength = store.state.config.device?.touchpad?.length || 0
      
      store.deleteTrigger(DeviceType.TOUCHPAD, 'touchpad-swipe-3-right')
      
      const triggers = store.state.config.device?.touchpad
      expect(triggers).toHaveLength(initialLength - 1)
      expect(triggers?.find(t => t.id === 'touchpad-swipe-3-right')).toBeUndefined()
      expect(store.state.isDirty).toBe(true)
    })
  })

  describe('action operations', () => {
    it('должен добавлять действие к триггеру', () => {
      const touchpadTriggers = store.state.config.device?.touchpad
      expect(touchpadTriggers).toBeDefined()
      expect(touchpadTriggers?.length).toBeGreaterThan(0)
      
      const triggerId = touchpadTriggers![0].id
      expect(triggerId).toBeDefined()
      
      const newAction = {
        on: TriggerEvent.END,
        input: [{ keyboard: ['-ctrl'] }]
      }

      store.addAction(DeviceType.TOUCHPAD, triggerId!, newAction)

      const trigger = store.state.config.device?.touchpad?.find(
        (t: any) => t.id === triggerId
      )
      expect(trigger).toBeDefined()
      expect(trigger?.actions).toHaveLength(2)
      expect(trigger?.actions?.[1].on).toBe(TriggerEvent.END)
    })

    it('должен обновлять действие триггера', () => {
      const touchpadTriggers = store.state.config.device?.touchpad
      expect(touchpadTriggers).toBeDefined()
      expect(touchpadTriggers?.length).toBeGreaterThan(0)
      
      const triggerId = touchpadTriggers![0].id
      expect(triggerId).toBeDefined()
      
      store.updateAction(
        DeviceType.TOUCHPAD,
        triggerId!,
        0,
        { input: [{ keyboard: ['+test'] }] }
      )

      const trigger = store.state.config.device?.touchpad?.find(
        (t: any) => t.id === triggerId
      )
      expect(trigger).toBeDefined()
    })

    it('должен удалять действие из триггера', () => {
      const touchpadTriggers = store.state.config.device?.touchpad
      expect(touchpadTriggers).toBeDefined()
      expect(touchpadTriggers?.length).toBeGreaterThan(0)
      
      const triggerId = touchpadTriggers![0].id
      expect(triggerId).toBeDefined()
      
      const trigger = store.state.config.device?.touchpad?.find(
        (t: any) => t.id === triggerId
      )
      const initialLength = trigger?.actions?.length || 0

      store.deleteAction(DeviceType.TOUCHPAD, triggerId!, 0)

      const updatedTrigger = store.state.config.device?.touchpad?.find(
        (t: any) => t.id === triggerId
      )
      expect(updatedTrigger).toBeDefined()
      expect(updatedTrigger?.actions).toHaveLength(initialLength - 1)
    })
  })

  describe('device rules operations', () => {
    it('должен добавлять устройство rule', () => {
      store.addDeviceRule({
        conditions: ['$name == Test Device'],
        buttonpad: true
      } as any)

      expect(store.deviceRules.value).toHaveLength(1)
      expect(store.state.config.device_rules?.[0].conditions).toEqual(['$name == Test Device'])
    })

    it('должен обновлять устройство rule', () => {
      store.addDeviceRule({
        conditions: ['original'],
        buttonpad: false
      } as any)

      store.updateDeviceRule(0, { buttonpad: true })

      expect(store.deviceRules.value[0].buttonpad).toBe(true)
    })

    it('должен удалять устройство rule', () => {
      while (store.state.config.device_rules?.length) {
        store.deleteDeviceRule(0)
      }
      
      store.addDeviceRule({ conditions: ['test'] } as any)
      expect(store.deviceRules.value).toHaveLength(1)

      store.deleteDeviceRule(0)
      expect(store.deviceRules.value).toHaveLength(0)
    })
  })

  describe('history operations', () => {
    it('должен сохранять историю изменений', () => {
      const initialHistoryIndex = store.state.historyIndex
      
      store.addTrigger(DeviceType.TOUCHPAD, {
        type: TriggerType.TAP,
        id: 'history-test',
        fingers: 2,
        actions: [{ on: TriggerEvent.BEGIN, input: [] }]
      })

      expect(store.state.historyIndex).toBe(initialHistoryIndex + 1)
      expect(store.state.history.length).toBe(initialHistoryIndex + 2)
      expect(store.canUndo.value).toBe(true)
    })

    it('должен выполнять undo', () => {
      store.addTrigger(DeviceType.TOUCHPAD, {
        type: TriggerType.TAP,
        id: 'undo-test',
        fingers: 2,
        actions: [{ on: TriggerEvent.BEGIN, input: [] }]
      })

      const triggersBeforeUndo = store.state.config.device?.touchpad?.length || 0

      store.undo()

      expect(store.state.config.device?.touchpad?.length).toBe(triggersBeforeUndo - 1)
      expect(store.canUndo.value).toBe(true)
    })

    it('должен выполнять redo', () => {
      store.addTrigger(DeviceType.TOUCHPAD, {
        type: TriggerType.TAP,
        id: 'redo-test',
        fingers: 2,
        actions: [{ on: TriggerEvent.BEGIN, input: [] }]
      })

      store.undo()
      store.redo()

      expect(store.state.config.device?.touchpad?.find((t: any) => t.id === 'redo-test')).toBeDefined()
      expect(store.canRedo.value).toBe(false)
    })

    it('должен ограничивать историю 50 элементами', () => {
      for (let i = 0; i < 60; i++) {
        store.addTrigger(DeviceType.TOUCHPAD, {
          type: TriggerType.TAP,
          id: `history-test-${i}`,
          fingers: 2,
          actions: [{ on: TriggerEvent.BEGIN, input: [] }]
        })
      }

      expect(store.state.history.length).toBeLessThanOrEqual(50)
    })
  })

  describe('loadConfig and getConfig', () => {
    it('должен загружать конфигурацию', () => {
      const newConfig = {
        device: {
          touchpad: [],
          mouse: [],
          keyboard: [],
          touchscreen: []
        },
        device_rules: [],
        settings: {}
      }

      store.loadConfig(newConfig as any)

      const config = store.getConfig()
      expect(config.device?.touchpad).toHaveLength(0)
      expect(store.state.isDirty).toBe(false)
    })

    it('должен возвращать глубокую копию конфигурации', () => {
      const config1 = store.getConfig()
      const config2 = store.getConfig()

      expect(config1).not.toBe(config2)
      expect(JSON.stringify(config1)).toBe(JSON.stringify(config2))
    })
  })

  describe('availableTriggers', () => {
    it('должен возвращать доступные типы триггеров для устройства', () => {
      store.setSelectedDevice(DeviceType.TOUCHPAD)
      
      const triggers = store.availableTriggers.value
      expect(triggers).toHaveLength(8) // touchpad имеет 8 типов триггеров
    })
  })

  describe('deleteDevice', () => {
    it('должен очищать все триггеры устройства', () => {
      store.deleteDevice(DeviceType.TOUCHPAD)
      
      expect(store.state.config.device?.touchpad).toHaveLength(0)
      expect(store.state.isDirty).toBe(true)
    })

    it('должен сбрасывать selectedDevice при удалении выбранного устройства', () => {
      store.state.selectedDevice = DeviceType.TOUCHPAD
      store.state.selectedTriggerId = 'test'
      
      store.deleteDevice(DeviceType.TOUCHPAD)
      
      expect(store.state.selectedDevice).toBeNull()
      expect(store.state.selectedTriggerId).toBeNull()
    })
  })
})
