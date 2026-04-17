import { describe, it, expect } from 'vitest'
import { parseInputActionsConfig, dumpInputActionsConfig } from './yaml-converter'
import { TriggerType, SwipeDirection, CircleDirection, TriggerEvent } from './types'

describe('yaml-converter', () => {
  describe('parseInputActionsConfig', () => {
    it('должен парсить пустой конфиг', () => {
      const yaml = ''
      const result = parseInputActionsConfig(yaml)

      expect(result.device).toBeDefined()
      expect(result.device_rules).toEqual([])
      expect(result.settings).toBeDefined()
    })

    it('должен парсить конфиг с device_rules', () => {
      const yaml = `
device_rules:
  - conditions: "$name == Test Device"
    buttonpad: true
`
      const result = parseInputActionsConfig(yaml)

      expect(result.device_rules).toHaveLength(1)
      expect(result.device_rules?.[0].conditions).toEqual(['$name == Test Device'])
      expect((result.device_rules?.[0] as any).buttonpad).toBe(true)
    })

    it('должен парсить touchpad свайпы', () => {
      const yaml = `
touchpad:
  gestures:
    - type: swipe
      direction: left
      fingers: 2
      id: test-swipe
      actions:
        - on: begin
          input:
            - keyboard: [+ctrl]
`
      const result = parseInputActionsConfig(yaml)

      expect(result.device?.touchpad).toBeDefined()
      expect(result.device?.touchpad).toHaveLength(1)

      const trigger = result.device?.touchpad?.[0] as any
      expect(trigger?.type).toBe(TriggerType.SWIPE)
      expect(trigger?.direction).toBe(SwipeDirection.LEFT)
      expect(trigger?.fingers).toBe(2)
      expect(trigger?.id).toBe('test-swipe')
      expect(trigger?.actions).toHaveLength(1)
      expect(trigger?.actions?.[0].on).toBe(TriggerEvent.BEGIN)
    })

    it('должен парсить несколько жестов на одном устройстве', () => {
      const yaml = `
touchpad:
  gestures:
    - type: swipe
      direction: left
      fingers: 3
      id: swipe-left-3
      actions:
        - on: begin
          input:
            - keyboard: [+ctrl]
    - type: swipe
      direction: right
      fingers: 3
      id: swipe-right-3
      actions:
        - on: begin
          input:
            - keyboard: [+alt]
    - type: tap
      fingers: 2
      id: tap-2
      actions:
        - on: begin
          input:
            - mouse: [+left]
`
      const result = parseInputActionsConfig(yaml)

      expect(result.device?.touchpad).toHaveLength(3)
      expect(result.device?.touchpad?.[0].id).toBe('swipe-left-3')
      expect(result.device?.touchpad?.[1].id).toBe('swipe-right-3')
      expect(result.device?.touchpad?.[2].id).toBe('tap-2')
    })

    it('должен парсить circle жесты', () => {
      const yaml = `
touchpad:
  gestures:
    - type: circle
      circle_direction: clockwise
      fingers: 1
      id: circle-cw
      actions:
        - on: update
          input:
            - keyboard: [+plus]
`
      const result = parseInputActionsConfig(yaml)

      const trigger = result.device?.touchpad?.[0] as any
      expect(trigger?.type).toBe(TriggerType.CIRCLE)
      expect(trigger?.circle_direction).toBe(CircleDirection.CLOCKWISE)
    })

    it('должен парсить mouse жесты', () => {
      const yaml = `
mouse:
  gestures:
    - type: swipe
      direction: up
      id: mouse-swipe-up
      actions:
        - on: begin
          input:
            - keyboard: [+super]
`
      const result = parseInputActionsConfig(yaml)

      expect(result.device?.mouse).toBeDefined()
      expect(result.device?.mouse).toHaveLength(1)
      expect(result.device?.mouse?.[0].type).toBe(TriggerType.SWIPE)
    })

    it('должен парсить keyboard шорткаты', () => {
      const yaml = `
keyboard:
  gestures:
    - type: shortcut
      id: test-shortcut
      actions:
        - on: begin
          input:
            - keyboard: [+ctrl, +alt, +t]
`
      const result = parseInputActionsConfig(yaml)

      expect(result.device?.keyboard).toBeDefined()
      expect(result.device?.keyboard).toHaveLength(1)
      expect(result.device?.keyboard?.[0].type).toBe(TriggerType.SHORTCUT)
    })

    it('должен парсить условия (conditions)', () => {
      const yaml = `
touchpad:
  gestures:
    - type: swipe
      direction: any
      id: conditional-swipe
      conditions:
        - $window_class == test.exe
        - $keyboard_modifiers == [shift]
      actions:
        - on: begin
          input:
            - mouse: [+left]
`
      const result = parseInputActionsConfig(yaml)

      const trigger = result.device?.touchpad?.[0]
      expect(trigger?.conditions).toHaveLength(2)
      expect(trigger?.conditions?.[0]).toBe('$window_class == test.exe')
      expect(trigger?.conditions?.[1]).toBe('$keyboard_modifiers == [shift]')
    })

    it('должен парсить resume_timeout и block_events', () => {
      const yaml = `
touchpad:
  gestures:
    - type: swipe
      direction: any
      id: timeout-test
      resume_timeout: 100
      block_events: true
      actions:
        - on: begin
          input:
            - mouse: [+left]
`
      const result = parseInputActionsConfig(yaml)

      const trigger = result.device?.touchpad?.[0]
      expect(trigger?.resume_timeout).toBe(100)
      expect(trigger?.block_events).toBe(true)
    })

    it('должен обрабатывать отсутствующие опциональные поля', () => {
      const yaml = `
touchpad:
  gestures:
    - type: tap
      id: minimal-tap
      fingers: 2
      actions:
        - on: begin
          input:
            - mouse: [+left]
`
      const result = parseInputActionsConfig(yaml)

      const trigger = result.device?.touchpad?.[0] as any
      expect(trigger?.type).toBe(TriggerType.TAP)
      expect(trigger?.direction).toBeUndefined()
      expect(trigger?.fingers).toBe(2)
    })
  })

  describe('dumpInputActionsConfig', () => {
    it('должен сериализовать пустой конфиг', () => {
      const config = {
        device: {},
        device_rules: [],
        settings: {}
      }

      const yaml = dumpInputActionsConfig(config as any)

      expect(yaml).toContain('device_rules:')
      expect(yaml).not.toContain('gestures:')
    })

    it('должен сериализовать touchpad свайпы', () => {
      const config = {
        device: {
          touchpad: [
            {
              type: TriggerType.SWIPE,
              id: 'test-swipe',
              direction: SwipeDirection.LEFT,
              fingers: 2,
              actions: [
                {
                  on: TriggerEvent.BEGIN,
                  input: [{ keyboard: ['+ctrl'] }]
                }
              ]
            }
          ]
        },
        device_rules: [],
        settings: {}
      }

      const yaml = dumpInputActionsConfig(config as any)

      expect(yaml).toContain('type: swipe')
      expect(yaml).toContain('direction: left')
      expect(yaml).toContain('fingers: 2')
      expect(yaml).toContain('id: test-swipe')
    })

    it('должен сериализовать несколько устройств', () => {
      const config = {
        device: {
          touchpad: [
            {
              type: TriggerType.TAP,
              id: 'tap-2',
              fingers: 2,
              actions: [{ on: TriggerEvent.BEGIN, input: [{ mouse: ['+left'] }] }]
            }
          ],
          keyboard: [
            {
              type: TriggerType.SHORTCUT,
              id: 'super-t',
              actions: [{ on: TriggerEvent.BEGIN, input: [{ keyboard: ['+super', '+t'] }] }]
            }
          ]
        },
        device_rules: [],
        settings: {}
      }

      const yaml = dumpInputActionsConfig(config as any)

      expect(yaml).toContain('touchpad:')
      expect(yaml).toContain('keyboard:')
      expect(yaml).toContain('id: tap-2')
      expect(yaml).toContain('id: super-t')
    })

    it('должен сохранять device_rules', () => {
      const config = {
        device: {},
        device_rules: [
          {
            conditions: '$name == Test Device',
            buttonpad: true
          }
        ],
        settings: {}
      }

      const yaml = dumpInputActionsConfig(config as any)

      expect(yaml).toContain('conditions:')
      expect(yaml).toContain('buttonpad: true')
    })

    it('должен сериализовать circle_direction', () => {
      const config = {
        device: {
          touchpad: [
            {
              type: TriggerType.CIRCLE,
              id: 'circle-test',
              circle_direction: CircleDirection.COUNTERCLOCKWISE,
              actions: [{ on: TriggerEvent.UPDATE, input: [] }]
            }
          ]
        },
        device_rules: [],
        settings: {}
      }

      const yaml = dumpInputActionsConfig(config as any)

      expect(yaml).toContain('circle_direction: counter-clockwise')
    })

    it('должен сериализовать resume_timeout и block_events', () => {
      const config = {
        device: {
          touchpad: [
            {
              type: TriggerType.SWIPE,
              id: 'timeout-test',
              direction: SwipeDirection.ANY,
              resume_timeout: 200,
              block_events: true,
              actions: [{ on: TriggerEvent.BEGIN, input: [] }]
            }
          ]
        },
        device_rules: [],
        settings: {}
      }

      const yaml = dumpInputActionsConfig(config as any)

      expect(yaml).toContain('resume_timeout: 200')
      expect(yaml).toContain('block_events: true')
    })
  })

  describe('roundtrip (parse -> dump -> parse)', () => {
    it('должен сохранять данные при круговом преобразовании для свайпов', () => {
      const originalYaml = `
touchpad:
  gestures:
    - type: swipe
      direction: left
      fingers: 3
      id: test-swipe
      resume_timeout: 100
      actions:
        - on: begin
          input:
            - keyboard: [+ctrl]
        - on: end
          input:
            - keyboard: [-ctrl]
device_rules: []
`
      const parsed1 = parseInputActionsConfig(originalYaml)
      const dumped = dumpInputActionsConfig(parsed1)
      const parsed2 = parseInputActionsConfig(dumped)

      expect(parsed2.device?.touchpad).toHaveLength(1)
      expect((parsed2.device?.touchpad?.[0] as any).id).toBe('test-swipe')
      expect((parsed2.device?.touchpad?.[0] as any).direction).toBe(SwipeDirection.LEFT)
      expect((parsed2.device?.touchpad?.[0] as any).fingers).toBe(3)
      expect((parsed2.device?.touchpad?.[0] as any).resume_timeout).toBe(100)
    })

    it('должен сохранять условия при круговом преобразовании', () => {
      const originalYaml = `
touchpad:
  gestures:
    - type: tap
      fingers: 2
      id: conditional-tap
      conditions:
        - $window_class == test.exe
        - $keyboard_modifiers == [shift]
      actions:
        - on: begin
          input:
            - mouse: [+left]
device_rules: []
`
      const parsed1 = parseInputActionsConfig(originalYaml)
      const dumped = dumpInputActionsConfig(parsed1)
      const parsed2 = parseInputActionsConfig(dumped)

      expect((parsed2.device?.touchpad?.[0] as any).conditions).toHaveLength(2)
    })
  })

  describe('обработка ошибок', () => {
    it('должен бросать ошибку для невалидного YAML', () => {
      const yaml = 'invalid: yaml: content: ['
      
      expect(() => parseInputActionsConfig(yaml)).toThrow()
    })

    it('должен возвращать пустой конфиг для null значения', () => {
      const yaml = 'null'
      
      const result = parseInputActionsConfig(yaml)
      expect(result.device).toBeDefined()
      expect(result.device_rules).toEqual([])
    })

    it('должен бросать ошибку для примитивного значения', () => {
      const yaml = 'just a string'
      
      expect(() => parseInputActionsConfig(yaml)).toThrow('Invalid config format')
    })
  })

  describe('специфичные сценарии из demo.config.yaml', () => {
    it('должен парсить сложный свайп с условиями и multiple actions', () => {
      const yaml = `
touchpad:
  gestures:
    - type: swipe
      direction: any
      fingers: 1
      resume_timeout: 50
      conditions:
        - any:
            - $window_class == kompas.exe
            - $window_class == OrcaSlicer
        - $keyboard_modifiers == [ shift ]
      actions:
        - on: begin
          input:
            - mouse: [ +middle ]
        - on: update
          input:
            - mouse: [ move_by_delta ]
        - on: end_cancel
          input:
            - mouse: [ -middle ]
device_rules: []
`
      const result = parseInputActionsConfig(yaml)

      const trigger = result.device?.touchpad?.[0] as any
      
      expect(trigger?.type).toBe(TriggerType.SWIPE)
      expect(trigger?.direction).toBe(SwipeDirection.ANY)
      expect(trigger?.fingers).toBe(1)
      expect(trigger?.resume_timeout).toBe(50)
      expect(trigger?.actions).toHaveLength(3)
      
      expect(trigger?.actions?.[0].on).toBe(TriggerEvent.BEGIN)
      expect(trigger?.actions?.[1].on).toBe(TriggerEvent.UPDATE)
      expect(trigger?.actions?.[2].on).toBe(TriggerEvent.END_CANCEL)
    })
  })
})
