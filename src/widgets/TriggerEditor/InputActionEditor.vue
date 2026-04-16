<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { BaseInput, BaseButton, BaseSelect } from '../../shared/ui/base'
import FieldHelp from '../../shared/ui/base/FieldHelp.vue'
import KeyboardModifierToggles from './KeyboardModifierToggles.vue'

interface Props {
  actionItem: {
    keyboard?: string[]
    mouse?: string[]
  }
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update': [item: { keyboard?: string[], mouse?: string[] }]
}>()

// Извлекаем модификаторы из keyboard массива
const modifiers = computed({
  get: () => {
    if (!props.actionItem.keyboard) return []
    return props.actionItem.keyboard
      .map(k => {
        // Убираем префиксы +, -
        const clean = k.replace(/^[+-]/, '')
        return clean.toLowerCase()
      })
      .filter(k => ['ctrl', 'alt', 'shift', 'meta', 'leftctrl', 'leftalt', 'leftshift', 'rightctrl', 'rightalt', 'rightshift'].includes(k))
  },
  set: (newModifiers: string[]) => {
    // Сохраняем только модификаторы, остальные actions оставляем как есть
    const otherActions = props.actionItem.keyboard?.filter(k => {
      const clean = k.replace(/^[+-]/, '').toLowerCase()
      return !['ctrl', 'alt', 'shift', 'meta', 'leftctrl', 'leftalt', 'leftshift', 'rightctrl', 'rightalt', 'rightshift'].includes(clean)
    }) || []
    
    const modifierActions = newModifiers.map(m => `+${m}`)
    const combined = [...modifierActions, ...otherActions]
    
    emit('update', {
      keyboard: combined.length ? combined : undefined,
      mouse: props.actionItem.mouse
    })
  }
})

const keyboardActions = ref<string[]>(props.actionItem.keyboard || [])
const mouseActions = ref<string[]>(props.actionItem.mouse || [])

watch([keyboardActions, mouseActions], () => {
  emit('update', {
    keyboard: keyboardActions.value.length ? keyboardActions.value : undefined,
    mouse: mouseActions.value.length ? mouseActions.value : undefined
  })
}, { deep: true })

const KEYBOARD_TYPES = [
  { value: '+', label: '+key (press)' },
  { value: '-', label: '-key (release)' },
  { value: 'combo', label: 'key1+key2 (combo)' },
  { value: 'text:', label: 'text: ... (type)' },
]

const MOUSE_TYPES = [
  { value: '+', label: '+button (press)' },
  { value: '-', label: '-button (release)' },
  { value: 'move_by', label: 'move_by x y' },
  { value: 'move_by_delta', label: 'move_by_delta' },
  { value: 'move_to', label: 'move_to x y' },
  { value: 'wheel', label: 'wheel x y' },
]

const MOUSE_BUTTONS = [
  { value: 'left', label: 'left' },
  { value: 'middle', label: 'middle' },
  { value: 'right', label: 'right' },
  { value: 'back', label: 'back' },
  { value: 'forward', label: 'forward' },
  { value: 'extra', label: 'extra' },
]

const keyboardHelp = `
+key - нажать
-key - отпустить
key1+key2 - комбинация (нажать вместе, отпустить в обратном порядке)
text: ... - ввод текста
`

const mouseHelp = `
+button - нажать кнопку
-button - отпустить кнопку
move_by x y - сдвинуть на x,y
move_by_delta [множитель] - сдвинуть на delta триггера
move_to x y - переместить в позицию
wheel x y - прокрутить колесо
`

const KEYBOARD_KEYS = [
  { value: 'ctrl', label: 'ctrl' },
  { value: 'alt', label: 'alt' },
  { value: 'shift', label: 'shift' },
  { value: 'meta', label: 'meta' },
  { value: 'a', label: 'a' }, { value: 'b', label: 'b' }, { value: 'c', label: 'c' },
  { value: 'd', label: 'd' }, { value: 'e', label: 'e' }, { value: 'f', label: 'f' },
  { value: 'g', label: 'g' }, { value: 'h', label: 'h' }, { value: 'i', label: 'i' },
  { value: 'j', label: 'j' }, { value: 'k', label: 'k' }, { value: 'l', label: 'l' },
  { value: 'm', label: 'm' }, { value: 'n', label: 'n' }, { value: 'o', label: 'o' },
  { value: 'p', label: 'p' }, { value: 'q', label: 'q' }, { value: 'r', label: 'r' },
  { value: 's', label: 's' }, { value: 't', label: 't' }, { value: 'u', label: 'u' },
  { value: 'v', label: 'v' }, { value: 'w', label: 'w' }, { value: 'x', label: 'x' },
  { value: 'y', label: 'y' }, { value: 'z', label: 'z' },
  { value: 'leftctrl', label: 'leftctrl' },
  { value: 'leftalt', label: 'leftalt' },
  { value: 'leftshift', label: 'leftshift' },
  { value: 'rightctrl', label: 'rightctrl' },
  { value: 'rightalt', label: 'rightalt' },
  { value: 'rightshift', label: 'rightshift' },
  { value: 'up', label: 'up' }, { value: 'down', label: 'down' },
  { value: 'left', label: 'left' }, { value: 'right', label: 'right' },
  { value: 'tab', label: 'tab' }, { value: 'enter', label: 'enter' },
  { value: 'space', label: 'space' }, { value: 'backspace', label: 'backspace' },
  { value: 'escape', label: 'escape' }, { value: 'esc', label: 'esc' },
  { value: 'f1', label: 'f1' }, { value: 'f2', label: 'f2' }, { value: 'f3', label: 'f3' },
  { value: 'f4', label: 'f4' }, { value: 'f5', label: 'f5' }, { value: 'f6', label: 'f6' },
  { value: 'f7', label: 'f7' }, { value: 'f8', label: 'f8' }, { value: 'f9', label: 'f9' },
  { value: 'f10', label: 'f10' }, { value: 'f11', label: 'f11' }, { value: 'f12', label: 'f12' },
]

const parseKeyboardAction = (action: string) => {
  if (action.startsWith('+')) return { type: '+', key: action.slice(1) }
  if (action.startsWith('-')) return { type: '-', key: action.slice(1) }
  if (action.startsWith('text:')) return { type: 'text:', value: action.slice(5) }
  if (action.includes('+')) return { type: 'combo', keys: action }
  return { type: '+', key: action }
}

const formatKeyboardAction = (parsed: any) => {
  if (parsed.type === 'text:') return `text: ${parsed.value || ''}`
  if (parsed.type === 'combo') return parsed.keys || ''
  return `${parsed.type}${parsed.key || ''}`
}

const parseMouseAction = (action: string) => {
  const parts = action.split(' ')
  const cmd = parts[0]
  if (cmd === 'move_by') return { type: 'move_by', x: parts[1] || '0', y: parts[2] || '0' }
  if (cmd === 'move_by_delta') return { type: 'move_by_delta', mult: parts[1] || '1' }
  if (cmd === 'move_to') return { type: 'move_to', x: parts[1] || '0', y: parts[2] || '0' }
  if (cmd === 'wheel') return { type: 'wheel', x: parts[1] || '0', y: parts[2] || '0' }
  if (cmd.startsWith('+')) return { type: '+', button: cmd.slice(1) }
  if (cmd.startsWith('-')) return { type: '-', button: cmd.slice(1) }
  if (cmd.includes('+')) return { type: 'combo', buttons: cmd }
  return { type: '+', button: cmd }
}

const formatMouseAction = (parsed: any) => {
  if (parsed.type === 'move_by') return `move_by ${parsed.x} ${parsed.y}`
  if (parsed.type === 'move_by_delta') return parsed.mult !== '1' ? `move_by_delta ${parsed.mult}` : 'move_by_delta'
  if (parsed.type === 'move_to') return `move_to ${parsed.x} ${parsed.y}`
  if (parsed.type === 'wheel') return `wheel ${parsed.x} ${parsed.y}`
  if (parsed.type === 'combo') return parsed.buttons || ''
  return `${parsed.type}${parsed.button || ''}`
}

const keyboardState = ref<any[]>(keyboardActions.value.map(parseKeyboardAction))
const mouseState = ref<any[]>(mouseActions.value.map(parseMouseAction))

watch([keyboardState, mouseState], () => {
  const kb = keyboardState.value.filter(a => a.type).map(formatKeyboardAction).filter(Boolean)
  const ms = mouseState.value.filter(a => a.type).map(formatMouseAction).filter(Boolean)
  emit('update', {
    keyboard: kb.length ? kb : undefined,
    mouse: ms.length ? ms : undefined
  })
}, { deep: true })

const addKeyboardAction = () => {
  keyboardState.value.push({ type: '+', key: 'left' })
}

const removeKeyboardAction = (i: number) => {
  keyboardState.value.splice(i, 1)
}

const addMouseAction = () => {
  mouseState.value.push({ type: 'move_by', x: '0', y: '0' })
}

const removeMouseAction = (i: number) => {
  mouseState.value.splice(i, 1)
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div>
      <div class="flex items-center gap-2 mb-2">
        <span class="text-sm font-medium text-gray-700">Keyboard</span>
        <FieldHelp>{{ keyboardHelp }}</FieldHelp>
      </div>
      
      <!-- Keyboard Modifiers Toggles -->
      <div class="mb-3">
        <label class="block text-xs font-medium text-gray-500 mb-1">Modifiers</label>
        <KeyboardModifierToggles v-model="modifiers" />
      </div>
      
      <div class="flex flex-col gap-2">
        <div v-for="(_, i) in keyboardState" :key="i" class="flex gap-2 items-center">
          <BaseSelect
            v-model="keyboardState[i].type"
            :options="KEYBOARD_TYPES"
            class="w-28"
          />
          <BaseInput
            v-if="keyboardState[i].type === 'text:'"
            v-model="keyboardState[i].value"
            placeholder="текст для ввода"
            class="flex-1"
          />
          <BaseSelect
            v-else-if="keyboardState[i].type === 'combo'"
            v-model="keyboardState[i].keys"
            :options="KEYBOARD_KEYS"
            multiple
            placeholder="выберите клавиши"
            class="flex-1"
          />
          <BaseSelect
            v-else
            v-model="keyboardState[i].key"
            :options="KEYBOARD_KEYS"
            placeholder="клавиша"
            class="flex-1"
          />
          <button
            class="delete-btn"
            @click="removeKeyboardAction(i)"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2.5 3.5H11.5M5 3.5V2.5C5 2.22386 5.22386 2 5.5 2H8.5C8.77614 2 9 2.22386 9 2.5V3.5M6 6.5V10.5M8 6.5V10.5M3 3.5L3.5 11.5C3.5 11.7761 3.72386 12 4 12H10C10.2761 12 10.5 11.7761 10.5 11.5L11 3.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <BaseButton size="sm" variant="ghost" @click="addKeyboardAction">
          + Add keyboard action
        </BaseButton>
      </div>
    </div>

    <div>
      <div class="flex items-center gap-2 mb-2">
        <span class="text-sm font-medium text-gray-700">Mouse</span>
        <FieldHelp>{{ mouseHelp }}</FieldHelp>
      </div>
      <div class="flex flex-col gap-2">
        <div v-for="(_, i) in mouseState" :key="i" class="flex gap-2 items-center">
          <BaseSelect
            v-model="mouseState[i].type"
            :options="MOUSE_TYPES"
            class="w-32"
            @update:model-value="(v) => {
              if (v === 'move_by' || v === 'move_to' || v === 'wheel') {
                mouseState[i].type = v
              } else if (v === 'move_by_delta') {
                mouseState[i].type = v
              }
            }"
          />
          <template v-if="['move_by', 'move_to', 'wheel'].includes(mouseState[i].type)">
            <BaseInput
              v-model="mouseState[i].x"
              type="number"
              placeholder="x"
              class="w-16"
            />
            <BaseInput
              v-model="mouseState[i].y"
              type="number"
              placeholder="y"
              class="w-16"
            />
          </template>
          <template v-else-if="mouseState[i].type === 'move_by_delta'">
            <BaseInput
              v-model="mouseState[i].mult"
              type="number"
              placeholder="множитель"
              class="w-20"
            />
          </template>
          <template v-else>
            <BaseSelect
              v-model="mouseState[i].button"
              :options="MOUSE_BUTTONS"
              placeholder="кнопка"
              class="flex-1"
            />
          </template>
          <button
            class="delete-btn"
            @click="removeMouseAction(i)"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2.5 3.5H11.5M5 3.5V2.5C5 2.22386 5.22386 2 5.5 2H8.5C8.77614 2 9 2.22386 9 2.5V3.5M6 6.5V10.5M8 6.5V10.5M3 3.5L3.5 11.5C3.5 11.7761 3.72386 12 4 12H10C10.2761 12 10.5 11.7761 10.5 11.5L11 3.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <BaseButton size="sm" variant="ghost" @click="addMouseAction">
          + Add mouse action
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.delete-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.15s ease;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.delete-btn:active {
  background: rgba(239, 68, 68, 0.25);
}
</style>