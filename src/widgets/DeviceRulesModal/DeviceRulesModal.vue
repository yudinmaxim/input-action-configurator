<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useConfigStore } from '../../shared/lib/stores/config'
import { DeviceRule } from '../../shared/lib/types'
import { BaseInput, BaseSelect, BaseCheckbox, BaseButton } from '../../shared/ui/base'
import { getInputDevices, type InputDevice } from '../../shared/api/config'

const props = withDefaults(defineProps<{
  modelValue: boolean
}>(), {
  modelValue: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const store = useConfigStore()

const rules = ref<DeviceRule[]>([])
const editingIndex = ref<number | null>(null)
const inputDevices = ref<InputDevice[]>([])
const loadingDevices = ref(false)

const loadInputDevices = async () => {
  loadingDevices.value = true
  try {
    const result = await getInputDevices()
    if (result.success) {
      inputDevices.value = result.devices
    } else {
      console.error('Failed to load devices:', result.error)
    }
  } catch (e) {
    console.error('Error loading input devices:', e)
  } finally {
    loadingDevices.value = false
  }
}

watch(() => store.deviceRules.value, (newRules) => {
  rules.value = JSON.parse(JSON.stringify(newRules))
}, { deep: true, immediate: true })

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    loadInputDevices()
  }
})

const devicesByCategory = computed(() => {
  const groups: Record<string, InputDevice[]> = {
    keyboard: [],
    mouse: [],
    touchpad: [],
    touchscreen: []
  }
  for (const device of inputDevices.value) {
    if (groups[device.device_type]) {
      groups[device.device_type].push(device)
    }
  }
  return groups
})

const categoryIcons: Record<string, string> = {
  keyboard: '⌨️',
  mouse: '🖱️',
  touchpad: '👆',
  touchscreen: '📱'
}

const categoryLabels: Record<string, string> = {
  keyboard: 'Клавиатура',
  mouse: 'Мышь',
  touchpad: 'Тачпад',
  touchscreen: 'Тачскрин'
}

const close = () => {
  emit('update:modelValue', false)
}

const saveAll = () => {
  store.state.config.device_rules = [...rules.value]
  store.state.isDirty = true
  store.saveToHistory()
  close()
}

const addRule = () => {
  rules.value.push({
    conditions: [],
    ignore: false
  })
  editingIndex.value = rules.value.length - 1
  loadInputDevices()
}

const selectDevice = (rule: DeviceRule, deviceName: string) => {
  if (!rule.conditions) rule.conditions = []
  const conditions = rule.conditions as any[]
  conditions.push(`$name == ${deviceName}`)
}

const removeRule = (index: number) => {
  rules.value.splice(index, 1)
  if (editingIndex.value === index) {
    editingIndex.value = null
  } else if (editingIndex.value !== null && editingIndex.value > index) {
    editingIndex.value--
  }
}

const DEVICE_CONDITION_VARS = [
  { value: '$name', label: '$name (имя устройства)' },
  { value: '$types', label: '$types (флаги типов)' },
  { value: '$keyboard', label: '$keyboard' },
  { value: '$mouse', label: '$mouse' },
  { value: '$touchpad', label: '$touchpad' },
  { value: '$touchscreen', label: '$touchscreen' },
]

const DEVICE_PROPERTIES = [
  { key: 'ignore', label: 'Ignore (игнорировать)', type: 'boolean' },
  { key: 'grab', label: 'Grab (перехват)', type: 'boolean' },
  { key: 'buttonpad', label: 'Buttonpad', type: 'boolean' },
  { key: 'handle_evdev_events', label: 'Handle Evdev Events', type: 'boolean' },
  { key: 'motion_timeout', label: 'Motion Timeout (ms)', type: 'number' },
  { key: 'motion_threshold', label: 'Motion Threshold', type: 'number' },
  { key: 'motion_threshold_2', label: 'Motion Threshold 2', type: 'number' },
  { key: 'motion_threshold_3', label: 'Motion Threshold 3', type: 'number' },
  { key: 'press_timeout', label: 'Press Timeout (ms)', type: 'number' },
  { key: 'click_timeout', label: 'Click Timeout (ms)', type: 'number' },
  { key: 'unblock_buttons_on_timeout', label: 'Unblock Buttons on Timeout', type: 'boolean' },
]

interface ParsedCondition {
  var: string
  op: string
  value: string
  raw: string
}

const parseCondition = (raw: string): ParsedCondition => {
  const match = raw.match(/^\$?(\w+)\s*(==|contains|!=|>=|<=)?\s*(.*)$/)
  if (match) {
    return {
      var: match[1].startsWith('$') ? match[1] : `$${match[1]}`,
      op: match[2] || '',
      value: match[3].trim().replace(/^["']|["']$/g, ''),
      raw
    }
  }
  return { var: raw, op: '', value: '', raw }
}

const serializeCondition = (parsed: ParsedCondition): string => {
  if (!parsed.op && !parsed.value) {
    return parsed.var
  }
  if (parsed.var === '$types' || parsed.var === '$name') {
    if (parsed.op === 'contains') {
      return `${parsed.var} ${parsed.op} ${parsed.value}`
    }
    return `${parsed.var} == ${parsed.value}`
  }
  return parsed.var
}

const getRuleDescription = (rule: DeviceRule): string => {
  // conditions может быть строкой или массивом
  if (!rule.conditions) {
    return 'Без условий'
  }
  if (typeof rule.conditions === 'string') {
    return rule.conditions
  }
  if (Array.isArray(rule.conditions)) {
    if (rule.conditions.length === 0) {
      return 'Без условий'
    }
    const condStr = rule.conditions
      .map((c: any) => typeof c === 'string' ? c : String(c))
      .join(', ')
    return condStr.length > 50 ? condStr.slice(0, 50) + '...' : condStr
  }
  return 'Без условий'
}

const getPropertyValue = (rule: DeviceRule, key: string): any => {
  if (key === 'swipe.angle_tolerance') {
    return rule.swipe?.angle_tolerance
  }
  return (rule as any)[key]
}

const setPropertyValue = (rule: DeviceRule, key: string, value: any) => {
  if (key === 'swipe.angle_tolerance') {
    if (!rule.swipe) rule.swipe = {}
    rule.swipe.angle_tolerance = value
  } else {
    (rule as any)[key] = value
  }
}

const addCondition = (rule: DeviceRule) => {
  if (!rule.conditions) rule.conditions = []
  ;(rule.conditions as any[]).push('$name == ')
}

const removeCondition = (rule: DeviceRule, index: number) => {
  rule.conditions?.splice(index, 1)
}

const updateConditionRaw = (rule: DeviceRule, index: number, raw: string) => {
  if (rule.conditions && rule.conditions[index] !== undefined) {
    ;(rule.conditions as any[])[index] = raw
  }
}

const TYPE_COLORS: Record<string, string> = {
  '$name': 'bg-blue-50 border-blue-200',
  '$types': 'bg-purple-50 border-purple-200',
  '$keyboard': 'bg-green-50 border-green-200',
  '$mouse': 'bg-amber-50 border-amber-200',
  '$touchpad': 'bg-cyan-50 border-cyan-200',
  '$touchscreen': 'bg-pink-50 border-pink-200',
}

const getConditionColor = (condition: any): string => {
  const parsed = parseCondition(String(condition))
  return TYPE_COLORS[parsed.var] || 'bg-gray-50 border-gray-200'
}

const needsValue = (condition: any): boolean => {
  const parsed = parseCondition(String(condition))
  return !['$keyboard', '$mouse', '$touchpad', '$touchscreen'].includes(parsed.var)
}

const getConditionsArray = (rule: DeviceRule): any[] => {
  if (!rule.conditions) return []
  if (typeof rule.conditions === 'string') return [rule.conditions]
  if (Array.isArray(rule.conditions)) return rule.conditions
  return []
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="modelValue" 
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        @click.self="close"
      >
        <div class="bg-slate-900 rounded-lg shadow-xl w-[900px] max-h-[85vh] overflow-hidden flex flex-col text-gray-200">
          <div class="px-6 py-4 border-b border-slate-700 flex justify-between items-center">
            <div class="flex items-center gap-3">
              <h3 class="text-lg font-semibold text-gray-200">Device Rules</h3>
              <span class="text-xs text-gray-400 bg-slate-800 px-2 py-1 rounded">
                {{ rules.length }} правил
              </span>
            </div>
            <BaseButton variant="icon" @click="close">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </BaseButton>
          </div>
          
          <div class="flex-1 overflow-auto p-4">
            <div v-if="rules.length === 0" class="text-center py-12 text-gray-400">
              <p>Нет правил для устройств</p>
              <p class="text-sm mt-1">Нажмите "Добавить правило" чтобы создать первое</p>
            </div>
            
            <div v-else class="flex flex-col gap-4">
              <div 
                v-for="(rule, index) in rules" 
                :key="index"
                class="border border-slate-700 rounded-lg overflow-hidden"
              >
                <div 
                  class="flex items-center justify-between px-4 py-3 bg-slate-800 cursor-pointer hover:bg-slate-750"
                  @click="editingIndex = editingIndex === index ? null : index"
                >
                  <div class="flex items-center gap-3">
                    <span class="text-sm font-medium text-gray-300">
                      Правило #{{ index + 1 }}
                    </span>
                    <span class="text-xs text-gray-500 max-w-md truncate">
                      {{ getRuleDescription(rule) }}
                    </span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span 
                      v-if="rule.ignore !== undefined"
                      class="text-xs px-2 py-1 rounded"
                      :class="rule.ignore ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'"
                    >
                      {{ rule.ignore ? 'ignore' : 'active' }}
                    </span>
                    <button class="delete-btn" @click.stop="removeRule(index)">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2.5 3.5H11.5M5 3.5V2.5C5 2.22386 5.22386 2 5.5 2H8.5C8.77614 2 9 2.22386 9 2.5V3.5M6 6.5V10.5M8 6.5V10.5M3 3.5L3.5 11.5C3.5 11.7761 3.72386 12 4 12H10C10.2761 12 10.5 11.7761 10.5 11.5L11 3.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </button>
                    <svg 
                      width="16" height="16" viewBox="0 0 16 16" fill="none" 
                      class="text-gray-500 transition-transform"
                      :class="{ 'rotate-180': editingIndex === index }"
                    >
                      <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                  </div>
                </div>
                
                <div v-if="editingIndex === index" class="p-4 bg-slate-800/50 space-y-4">
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <label class="text-sm font-medium text-gray-300">Conditions</label>
                      <BaseButton variant="blue" size="sm" @click="addCondition(rule)">
                        + условие
                      </BaseButton>
                    </div>
                    
                    <div v-if="inputDevices.length > 0" class="mb-3">
                      <div class="text-xs text-gray-400 mb-2">Выберите устройство:</div>
                      <div class="flex flex-col gap-3">
                        <div 
                          v-for="(devices, category) in devicesByCategory" 
                          :key="category"
                          v-show="devices.length > 0"
                        >
                          <div class="flex items-center gap-2 mb-1 text-xs font-medium" :class="{
                            'text-green-400': category === 'keyboard',
                            'text-amber-400': category === 'mouse',
                            'text-cyan-400': category === 'touchpad',
                            'text-pink-400': category === 'touchscreen'
                          }">
                            <span>{{ categoryIcons[category] }}</span>
                            <span>{{ categoryLabels[category] }}</span>
                            <span class="text-gray-500">({{ devices.length }})</span>
                          </div>
                          <div class="flex flex-wrap gap-1">
                            <BaseButton
                              v-for="device in devices"
                              :key="device.name"
                              variant="blue"
                              size="sm"
                              :title="device.name"
                              @click="selectDevice(rule, device.name)"
                            >
                              {{ device.name.length > 35 ? device.name.slice(0, 35) + '...' : device.name }}
                            </BaseButton>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div v-if="getConditionsArray(rule).length > 0" class="flex flex-col gap-2">
                      <div 
                        v-for="(cond, condIndex) in getConditionsArray(rule)" 
                        :key="condIndex"
                        class="flex items-center gap-2 p-2 rounded border"
                        :class="getConditionColor(cond)"
                      >
                        <BaseSelect
                          :model-value="parseCondition(String(cond)).var"
                          :options="DEVICE_CONDITION_VARS"
                          class="w-48"
                          @update:model-value="(v) => {
                            const parsed = parseCondition(String(cond))
                            parsed.var = v as string
                            updateConditionRaw(rule, condIndex, serializeCondition(parsed))
                          }"
                        />
                        <template v-if="needsValue(cond)">
                          <span class="text-gray-500 text-sm">==</span>
                          <BaseInput
                            :model-value="parseCondition(String(cond)).value"
                            placeholder="значение"
                            class="flex-1"
                            @update:model-value="(v) => {
                              const parsed = parseCondition(String(cond))
                              parsed.value = v as string
                              updateConditionRaw(rule, condIndex, serializeCondition(parsed))
                            }"
                          />
                        </template>
                        <template v-else>
                          <span class="text-gray-500 text-sm italic">(boolean flag)</span>
                        </template>
                        <button class="delete-btn" @click="removeCondition(rule, condIndex)">
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M2.5 3.5H11.5M5 3.5V2.5C5 2.22386 5.22386 2 5.5 2H8.5C8.77614 2 9 2.22386 9 2.5V3.5M6 6.5V10.5M8 6.5V10.5M3 3.5L3.5 11.5C3.5 11.7761 3.72386 12 4 12H10C10.2761 12 10.5 11.7761 10.5 11.5L11 3.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p v-else class="text-xs text-gray-500 italic">
                      Без условий - правило применяется ко всем устройствам
                    </p>
                  </div>
                  
                  <div>
                    <label class="text-sm font-medium text-gray-300 mb-2 block">Properties</label>
                    <div class="grid grid-cols-2 gap-3">
                      <div 
                        v-for="prop in DEVICE_PROPERTIES" 
                        :key="prop.key"
                        class="flex items-center gap-2 p-2 bg-slate-700/50 rounded"
                      >
                        <BaseCheckbox
                          v-if="prop.type === 'boolean'"
                          :model-value="getPropertyValue(rule, prop.key) === true"
                          @update:model-value="(v) => setPropertyValue(rule, prop.key, v)"
                        />
                        <span class="text-sm text-gray-400 flex-1">{{ prop.label }}</span>
                        <BaseInput
                          v-if="prop.type === 'number'"
                          type="number"
                          :model-value="getPropertyValue(rule, prop.key) || ''"
                          class="w-24"
                          @update:model-value="(v) => setPropertyValue(rule, prop.key, Number(v))"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="px-6 py-4 border-t border-slate-700 flex justify-between items-center bg-slate-800">
            <BaseButton variant="blue" @click="addRule">
              + Добавить правило
            </BaseButton>
            <div class="flex gap-3">
              <BaseButton variant="secondary" @click="close">
                Отмена
              </BaseButton>
              <BaseButton variant="green" @click="saveAll">
                Сохранить
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

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
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.delete-btn:active {
  transform: scale(0.9);
}
</style>
