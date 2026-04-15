<script setup lang="ts">
import { ref, watch } from 'vue'
import { BaseInput, BaseSelect, BaseCard } from '../../shared/ui/base'
import KeyboardModifierToggles from './KeyboardModifierToggles.vue'
import FieldHelp from '../../shared/ui/base/FieldHelp.vue'

interface InputEntry {
  keyboard?: string[]
  mouse?: string[]
}

interface ActionItem {
  on: string
  command?: string
  input?: InputEntry[]
  shortcut?: string
  time?: number
}

interface Props {
  selectedDevice: string | null
  selectedTriggerId: string | null
  actions: any[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update-action': [index: number, updates: any]
  'delete-action': [index: number]
  'add-action': [action: any]
}>()

const list = ref<ActionItem[]>([])

const EVENT_COLORS: Record<string, string> = {
  'begin': 'bg-blue-50 border-blue-200',
  'update': 'bg-green-50 border-green-200',
  'tick': 'bg-amber-50 border-amber-200',
  'end': 'bg-purple-50 border-purple-200',
  'cancel': 'bg-red-50 border-red-200',
  'end_cancel': 'bg-orange-50 border-orange-200',
}

const EVENT_LABELS: Record<string, string> = {
  'begin': 'Начало (begin)',
  'update': 'Обновление (update)',
  'tick': 'Тик (tick)',
  'end': 'Конец (end)',
  'cancel': 'Отмена (cancel)',
  'end_cancel': 'Конец отмены (end_cancel)',
}

const EVENT_COLORS_TEXT: Record<string, string> = {
  'begin': 'text-blue-600',
  'update': 'text-green-600',
  'tick': 'text-amber-600',
  'end': 'text-purple-600',
  'cancel': 'text-red-600',
  'end_cancel': 'text-orange-600',
}

function syncList() {
  list.value = (props.actions || []).map(a => ({ ...a })) as ActionItem[]
}

watch(() => props.actions, syncList, { immediate: true, deep: true })

function getActionType(action: ActionItem): 'command' | 'input' | 'shortcut' | 'sleep' | 'empty' {
  if (action.command !== undefined) return 'command'
  if (action.input !== undefined && action.input.length > 0) return 'input'
  if (action.shortcut !== undefined) return 'shortcut'
  if (action.time !== undefined) return 'sleep'
  return 'empty'
}

function getInputType(entry: InputEntry): 'keyboard' | 'mouse' {
  if (entry.keyboard && entry.keyboard.length > 0) return 'keyboard'
  if (entry.mouse && entry.mouse.length > 0) return 'mouse'
  return 'keyboard'
}

function updateEventType(index: number, eventType: string) {
  emit('update-action', index, { on: eventType })
}

function updateActionType(index: number, newType: string) {
  const updates: any = {}
  
  switch (newType) {
    case 'command':
      updates.command = 'echo'
      delete updates.input
      delete updates.shortcut
      delete updates.time
      break
    case 'input':
      updates.input = [{ keyboard: [] }]
      delete updates.command
      delete updates.shortcut
      delete updates.time
      break
    case 'shortcut':
      updates.shortcut = 'Alt+F4'
      delete updates.command
      delete updates.input
      delete updates.time
      break
    case 'sleep':
      updates.time = 100
      delete updates.command
      delete updates.input
      delete updates.shortcut
      break
  }
  
  emit('update-action', index, updates)
}

function addInputEntry(actionIndex: number, type: 'keyboard' | 'mouse') {
  const action = list.value[actionIndex]
  const newEntry: InputEntry = type === 'keyboard' 
    ? { keyboard: [] }
    : { mouse: ['+left'] }
  
  const newInput = [...(action.input || []), newEntry]
  emit('update-action', actionIndex, { input: newInput })
}

function removeInputEntry(actionIndex: number, entryIndex: number) {
  const action = list.value[actionIndex]
  const newInput = [...(action.input || [])]
  newInput.splice(entryIndex, 1)
  emit('update-action', actionIndex, { input: newInput.length > 0 ? newInput : undefined })
}

function changeInputEntryType(actionIndex: number, entryIndex: number, newType: 'keyboard' | 'mouse') {
  const action = list.value[actionIndex]
  const newInput = [...(action.input || [])]
  newInput[entryIndex] = newType === 'keyboard' 
    ? { keyboard: newInput[entryIndex].mouse || [] }
    : { mouse: newInput[entryIndex].keyboard || [] }
  emit('update-action', actionIndex, { input: newInput })
}

function getKeyboardModifiers(entry: InputEntry): string[] {
  if (!entry.keyboard) return []
  return entry.keyboard
    .map(k => k.replace(/^[+-]/, '').toLowerCase())
    .filter(k => ['ctrl', 'alt', 'shift', 'meta', 'leftctrl', 'leftalt', 'leftshift', 'rightctrl', 'rightalt', 'rightshift'].includes(k))
}

function getKeyboardKeys(entry: InputEntry): string[] {
  if (!entry.keyboard) return []
  return entry.keyboard.filter(k => {
    const clean = k.replace(/^[+-]/, '').toLowerCase()
    return !['ctrl', 'alt', 'shift', 'meta', 'leftctrl', 'leftalt', 'leftshift', 'rightctrl', 'rightalt', 'rightshift'].includes(clean)
  })
}

function updateKeyboardModifiers(actionIndex: number, entryIndex: number, modifiers: string[]) {
  const action = list.value[actionIndex]
  const entry = action.input?.[entryIndex]
  if (!entry) return
  
  const keys = getKeyboardKeys(entry)
  const modifierActions = modifiers.map(m => `+${m}`)
  const combined = [...modifierActions, ...keys]
  
  const newInput = [...(action.input || [])]
  newInput[entryIndex] = { keyboard: combined }
  emit('update-action', actionIndex, { input: newInput })
}

function updateKeyboardKeys(actionIndex: number, entryIndex: number, keys: string[]) {
  const action = list.value[actionIndex]
  const entry = action.input?.[entryIndex]
  if (!entry) return
  
  const modifiers = getKeyboardModifiers(entry)
  const modifierActions = modifiers.map(m => `+${m}`)
  const combined = [...modifierActions, ...keys]
  
  const newInput = [...(action.input || [])]
  newInput[entryIndex] = { keyboard: combined }
  emit('update-action', actionIndex, { input: newInput })
}

function parseMouseAction(action: string) {
  const parts = action.split(' ')
  const cmd = parts[0]
  if (cmd === 'move_by') return { type: 'move_by', x: parts[1] || '0', y: parts[2] || '0' }
  if (cmd === 'move_by_delta') return { type: 'move_by_delta', mult: parts[1] || '1' }
  if (cmd === 'move_to') return { type: 'move_to', x: parts[1] || '0', y: parts[2] || '0' }
  if (cmd === 'wheel') return { type: 'wheel', x: parts[1] || '0', y: parts[2] || '0' }
  if (cmd.startsWith('+')) return { type: '+', button: cmd.slice(1) }
  if (cmd.startsWith('-')) return { type: '-', button: cmd.slice(1) }
  return { type: '+', button: cmd }
}

function formatMouseAction(parsed: any) {
  if (parsed.type === 'move_by') return `move_by ${parsed.x} ${parsed.y}`
  if (parsed.type === 'move_by_delta') return parsed.mult !== '1' ? `move_by_delta ${parsed.mult}` : 'move_by_delta'
  if (parsed.type === 'move_to') return `move_to ${parsed.x} ${parsed.y}`
  if (parsed.type === 'wheel') return `wheel ${parsed.x} ${parsed.y}`
  return `${parsed.type}${parsed.button || ''}`
}

function updateMouseActions(actionIndex: number, entryIndex: number, actions: string[]) {
  const action = list.value[actionIndex]
  const newInput = [...(action.input || [])]
  newInput[entryIndex] = { mouse: actions }
  emit('update-action', actionIndex, { input: newInput })
}

function remove(index: number) {
  emit('delete-action', index)
}

function addAction(eventType: string) {
  emit('add-action', { on: eventType, input: [{ keyboard: [] }] })
}

const EVENT_OPTIONS = [
  { value: 'begin', label: 'begin' },
  { value: 'update', label: 'update' },
  { value: 'tick', label: 'tick' },
  { value: 'end', label: 'end' },
  { value: 'cancel', label: 'cancel' },
  { value: 'end_cancel', label: 'end_cancel' },
]

const MOUSE_BUTTONS = [
  { value: 'left', label: 'left' },
  { value: 'middle', label: 'middle' },
  { value: 'right', label: 'right' },
  { value: 'back', label: 'back' },
  { value: 'forward', label: 'forward' },
  { value: 'extra', label: 'extra' },
]

const MOUSE_TYPES = [
  { value: '+', label: '+button' },
  { value: '-', label: '-button' },
  { value: 'move_by_delta', label: 'move_by_delta' },
  { value: 'move_by', label: 'move_by x y' },
  { value: 'move_to', label: 'move_to x y' },
  { value: 'wheel', label: 'wheel x y' },
]

const helpText = `
input actions:

mouse:
  +button - press
  -button - release  
  move_by_delta [mult] - move by trigger delta
  move_by x y - move by x,y
  move_to x y - move to position
  wheel x y - scroll

keyboard:
  +key - press
  -key - release
  key1+key2 - combo

command - shell command
shortcut - Plasma shortcut
sleep - milliseconds
`
</script>

<template>
  <BaseCard title="Actions">
    <div class="flex flex-col gap-3">
      <div v-for="(action, actionIndex) in list" :key="actionIndex" 
        class="flex flex-col gap-3 p-3 rounded-lg border"
        :class="EVENT_COLORS[action.on] || 'bg-gray-50 border-gray-200'"
      >
        <!-- Header -->
        <div class="flex items-center justify-between">
          <span class="text-sm font-semibold" :class="EVENT_COLORS_TEXT[action.on] || 'text-gray-600'">
            {{ EVENT_LABELS[action.on] || action.on }}
          </span>
          <button class="text-red-500 hover:text-red-700" @click="remove(actionIndex)">✕</button>
        </div>
        
        <!-- Тип экшена -->
        <div class="flex items-center gap-2 flex-wrap">
          <BaseSelect
            :model-value="action.on"
            :options="EVENT_OPTIONS"
            class="w-32"
            @update:model-value="(v) => updateEventType(actionIndex, String(v))"
          />
          
          <span class="text-gray-400">→</span>
          
          <BaseSelect
            :model-value="getActionType(action)"
            :options="[
              { value: 'input', label: 'Input' },
              { value: 'command', label: 'Command' },
              { value: 'shortcut', label: 'Shortcut' },
              { value: 'sleep', label: 'Sleep' },
            ]"
            class="w-28"
            @update:model-value="(v) => updateActionType(actionIndex, String(v))"
          />
        </div>
        
        <!-- Input entries -->
        <template v-if="getActionType(action) === 'input'">
          <div class="flex flex-col gap-2 pl-4 border-l-2 border-gray-300">
            <div v-for="(entry, entryIndex) in action.input" :key="entryIndex" 
              class="flex flex-col gap-2 p-2 bg-white rounded border border-gray-200"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <BaseSelect
                    :model-value="getInputType(entry)"
                    :options="[
                      { value: 'keyboard', label: '⌨️ Keyboard' },
                      { value: 'mouse', label: '🖱️ Mouse' },
                    ]"
                    class="w-36"
                    @update:model-value="(v) => changeInputEntryType(actionIndex, entryIndex, String(v) as 'keyboard' | 'mouse')"
                  />
                </div>
                <button 
                  class="text-red-400 hover:text-red-600 text-xs"
                  @click="removeInputEntry(actionIndex, entryIndex)"
                >
                  ✕
                </button>
              </div>
              
              <!-- Keyboard -->
              <template v-if="getInputType(entry) === 'keyboard'">
                <div class="flex flex-col gap-2">
                  <div>
                    <label class="text-xs text-gray-500 mb-1 block">Modifiers</label>
                    <KeyboardModifierToggles
                      :model-value="getKeyboardModifiers(entry)"
                      @update:model-value="(v) => updateKeyboardModifiers(actionIndex, entryIndex, v as string[])"
                    />
                  </div>
                  <div>
                    <label class="text-xs text-gray-500 mb-1 block">Keys</label>
                    <BaseInput
                      :model-value="getKeyboardKeys(entry).join(', ')"
                      placeholder="a, b, c или alt+tab"
                      @update:model-value="(v) => {
                        const keys = String(v).split(',').map(s => s.trim()).filter(Boolean)
                        updateKeyboardKeys(actionIndex, entryIndex, keys)
                      }"
                    />
                  </div>
                </div>
              </template>
              
              <!-- Mouse -->
              <template v-if="getInputType(entry) === 'mouse'">
                <div class="flex flex-col gap-1">
                  <div v-for="(mouseAction, mi) in entry.mouse || []" :key="mi" class="flex gap-2 items-center">
                    <BaseSelect
                      :model-value="parseMouseAction(mouseAction).type"
                      :options="MOUSE_TYPES"
                      class="w-32"
                      @update:model-value="(type) => {
                        const parsed = parseMouseAction(mouseAction)
                        parsed.type = String(type)
                        const actions = [...(entry.mouse || [])]
                        actions[mi] = formatMouseAction(parsed)
                        updateMouseActions(actionIndex, entryIndex, actions)
                      }"
                    />
                    
                    <template v-if="parseMouseAction(mouseAction).type === '+' || parseMouseAction(mouseAction).type === '-'">
                      <BaseSelect
                        :model-value="parseMouseAction(mouseAction).button"
                        :options="MOUSE_BUTTONS"
                        placeholder="button"
                        class="flex-1"
                        @update:model-value="(btn) => {
                          const parsed = parseMouseAction(mouseAction)
                          parsed.button = String(btn)
                          const actions = [...(entry.mouse || [])]
                          actions[mi] = formatMouseAction(parsed)
                          updateMouseActions(actionIndex, entryIndex, actions)
                        }"
                      />
                    </template>
                    
                    <template v-else-if="['move_by', 'move_to', 'wheel'].includes(parseMouseAction(mouseAction).type)">
                      <BaseInput
                        :model-value="parseMouseAction(mouseAction).x"
                        type="number"
                        placeholder="x"
                        class="w-16"
                        @update:model-value="(x) => {
                          const parsed = parseMouseAction(mouseAction)
                          parsed.x = String(x)
                          const actions = [...(entry.mouse || [])]
                          actions[mi] = formatMouseAction(parsed)
                          updateMouseActions(actionIndex, entryIndex, actions)
                        }"
                      />
                      <BaseInput
                        :model-value="parseMouseAction(mouseAction).y"
                        type="number"
                        placeholder="y"
                        class="w-16"
                        @update:model-value="(y) => {
                          const parsed = parseMouseAction(mouseAction)
                          parsed.y = String(y)
                          const actions = [...(entry.mouse || [])]
                          actions[mi] = formatMouseAction(parsed)
                          updateMouseActions(actionIndex, entryIndex, actions)
                        }"
                      />
                    </template>
                    
                    <button 
                      class="text-red-400 hover:text-red-600 text-xs"
                      @click="() => {
                        const actions = [...(entry.mouse || [])]
                        actions.splice(mi, 1)
                        updateMouseActions(actionIndex, entryIndex, actions)
                      }"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <button 
                    class="text-xs text-blue-500 text-left"
                    @click="() => {
                      const actions = [...(entry.mouse || []), '+left']
                      updateMouseActions(actionIndex, entryIndex, actions)
                    }"
                  >
                    + mouse action
                  </button>
                </div>
              </template>
            </div>
            
            <!-- Add input entry -->
            <div class="flex gap-2">
              <button 
                class="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs border"
                @click="addInputEntry(actionIndex, 'keyboard')"
              >
                + ⌨️ Keyboard
              </button>
              <button 
                class="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs border"
                @click="addInputEntry(actionIndex, 'mouse')"
              >
                + 🖱️ Mouse
              </button>
            </div>
          </div>
        </template>
        
        <!-- Command -->
        <template v-if="getActionType(action) === 'command'">
          <div class="pl-4 border-l-2 border-gray-300">
            <BaseInput
              :model-value="action.command || ''"
              placeholder="notify-send 'Hello'"
              @update:model-value="(v) => emit('update-action', actionIndex, { command: String(v) })"
            />
          </div>
        </template>
        
        <!-- Shortcut -->
        <template v-if="getActionType(action) === 'shortcut'">
          <div class="pl-4 border-l-2 border-gray-300">
            <BaseInput
              :model-value="action.shortcut || ''"
              placeholder="Alt+F4"
              @update:model-value="(v) => emit('update-action', actionIndex, { shortcut: String(v) })"
            />
          </div>
        </template>
        
        <!-- Sleep -->
        <template v-if="getActionType(action) === 'sleep'">
          <div class="pl-4 border-l-2 border-gray-300 flex items-center gap-2">
            <BaseInput
              :model-value="String(action.time || 100)"
              type="number"
              class="w-24"
              @update:model-value="(v) => emit('update-action', actionIndex, { time: Number(v) })"
            />
            <span class="text-sm text-gray-500">ms</span>
          </div>
        </template>
      </div>
      
      <!-- Add action buttons -->
      <div class="flex flex-wrap gap-2">
        <button 
          v-for="event in ['begin', 'update', 'end', 'cancel', 'end_cancel']"
          :key="event"
          class="px-3 py-1.5 rounded-md text-sm font-medium border"
          :class="EVENT_COLORS[event].replace('bg-', 'hover:bg-').replace('-50', '-100')"
          @click="addAction(event)"
        >
          + {{ EVENT_LABELS[event] }}
        </button>
        
        <button 
          class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium border border-gray-300"
          @click="addAction('tick')"
        >
          + {{ EVENT_LABELS['tick'] }}
        </button>
      </div>
      
      <FieldHelp><slot>{{ helpText }}</slot></FieldHelp>
    </div>
  </BaseCard>
</template>