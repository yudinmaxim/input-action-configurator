<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useConfigStore } from '../../shared/lib/stores/config'
import { DeviceRule } from '../../shared/lib/types'
import { BaseInput, BaseSelect, BaseCheckbox, BaseButton } from '../../shared/ui/base'
import FieldHelp from '../../shared/ui/base/FieldHelp.vue'
import { getInputDevices, type InputDevice } from '../../shared/api/config'

const store = useConfigStore()

const editingIndex = ref<number | null>(null)
const inputDevices = ref<InputDevice[]>([])
const loadingDevices = ref(false)

const rules = computed(() => store.state.config.device_rules || [])

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

watch(() => store.state.selectedDevice, (newDevice) => {
  loadInputDevices()
  if (newDevice === 'device-rules' && rules.value.length > 0) {
    editingIndex.value = 0
  }
}, { immediate: true })

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

const DEVICE_CONDITION_VARS = [
  { value: '$name', label: '$name (имя устройства)' },
  { value: '$types', label: '$types (флаги типов)' },
  { value: '$keyboard', label: '$keyboard' },
  { value: '$mouse', label: '$mouse' },
  { value: '$touchpad', label: '$touchpad' },
  { value: '$touchscreen', label: '$touchscreen' },
]

const DEVICE_PROPERTIES = [
  { key: 'ignore', label: 'Ignore', description: 'Игнорировать устройство полностью (не обрабатывать события)', type: 'boolean' },
  { key: 'grab', label: 'Grab', description: 'Перехватывать события устройства (эксклюзивный доступ)', type: 'boolean' },
  { key: 'buttonpad', label: 'Buttonpad', description: 'Устройство является кнопочным тачпадом (без、物理ческих кнопок)', type: 'boolean' },
  { key: 'handle_evdev_events', label: 'Handle Evdev Events', description: 'Обрабатывать сырые события evdev', type: 'boolean' },
  { key: 'motion_timeout', label: 'Motion Timeout (ms)', description: 'Таймаут бездействия движения в миллисекундах', type: 'number' },
  { key: 'motion_threshold', label: 'Motion Threshold', description: 'Порог движения для начала отслеживания', type: 'number' },
  { key: 'motion_threshold_2', label: 'Motion Threshold 2', description: 'Вторичный порог движения (для многоуровневого отслеживания)', type: 'number' },
  { key: 'motion_threshold_3', label: 'Motion Threshold 3', description: 'Третичный порог движения', type: 'number' },
  { key: 'press_timeout', label: 'Press Timeout (ms)', description: 'Таймаут нажатия в миллисекундах (до определения жеста)', type: 'number' },
  { key: 'click_timeout', label: 'Click Timeout (ms)', description: 'Таймаут между кликами для определения мульти-клика', type: 'number' },
  { key: 'unblock_buttons_on_timeout', label: 'Unblock Buttons on Timeout', description: 'Разблокировать кнопки после таймаута', type: 'boolean' },
]

const addRule = () => {
  if (!store.state.config.device_rules) {
    store.state.config.device_rules = []
  }
  store.state.config.device_rules.push({
    conditions: [],
    ignore: false
  })
  editingIndex.value = store.state.config.device_rules.length - 1
  markDirty()
  loadInputDevices()
}

const removeRule = (index: number) => {
  store.state.config.device_rules?.splice(index, 1)
  if (editingIndex.value === index) {
    editingIndex.value = null
  } else if (editingIndex.value !== null && editingIndex.value > index) {
    editingIndex.value--
  }
  markDirty()
}

const selectDevice = (rule: DeviceRule, deviceName: string) => {
  if (!rule.conditions) rule.conditions = []
  ;(rule.conditions as any[]).push(`$name == ${deviceName}`)
  markDirty()
}

const parseCondition = (raw: string): { var: string; op: string; value: string } => {
  const match = raw.match(/^\$?(\w+)\s*(==|contains|!=|>=|<=)?\s*(.*)$/)
  if (match) {
    return {
      var: match[1].startsWith('$') ? match[1] : `$${match[1]}`,
      op: match[2] || '',
      value: match[3].trim().replace(/^["']|["']$/g, '')
    }
  }
  return { var: raw, op: '', value: '' }
}

const serializeCondition = (parsed: { var: string; op: string; value: string }): string => {
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
  if (!rule.conditions || !Array.isArray(rule.conditions) || rule.conditions.length === 0) {
    return 'Без условий'
  }
  const condStr = rule.conditions
    .map((c: any) => typeof c === 'string' ? c : String(c))
    .join(', ')
  return condStr.length > 50 ? condStr.slice(0, 50) + '...' : condStr
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
  markDirty()
}

const addCondition = (rule: DeviceRule) => {
  if (!rule.conditions) rule.conditions = []
  ;(rule.conditions as any[]).push('$name == ')
  markDirty()
}

const removeCondition = (rule: DeviceRule, index: number) => {
  rule.conditions?.splice(index, 1)
  markDirty()
}

const updateConditionRaw = (rule: DeviceRule, index: number, raw: string) => {
  if (rule.conditions && rule.conditions[index] !== undefined) {
    ;(rule.conditions as any[])[index] = raw
  }
  markDirty()
}

const getConditionsArray = (rule: DeviceRule): any[] => {
  if (!rule.conditions) return []
  if (typeof rule.conditions === 'string') return [rule.conditions]
  if (Array.isArray(rule.conditions)) return rule.conditions
  return []
}

const needsValue = (condition: any): boolean => {
  const parsed = parseCondition(String(condition))
  return !['$keyboard', '$mouse', '$touchpad', '$touchscreen'].includes(parsed.var)
}

const markDirty = () => {
  store.state.isDirty = true
  store.saveToHistory()
}
</script>

<template>
  <div class="h-full flex flex-col bg-gray-50">
    <div class="flex-1 overflow-auto p-4">
      <div v-if="rules.length === 0" class="text-center py-12">
        <p class="text-gray-500">Нет правил для устройств</p>
        <p class="text-sm text-gray-400 mt-1">Нажмите "Добавить правило" чтобы создать первое</p>
      </div>
      
      <div v-else class="flex flex-col gap-4">
        <div 
          v-for="(rule, index) in rules" 
          :key="index"
          class="border border-gray-200 rounded-lg overflow-hidden bg-white"
        >
          <div 
            class="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
            @click="editingIndex = editingIndex === index ? null : index"
          >
            <div class="flex items-center gap-3">
              <span class="text-sm font-medium text-gray-700">
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
                :class="rule.ignore ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'"
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
                class="text-gray-400 transition-transform"
                :class="{ 'rotate-180': editingIndex === index }"
              >
                <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </div>
          </div>
          
          <div v-if="editingIndex === index" class="p-4 border-t border-gray-200 space-y-4">
            <div>
              <label class="text-sm font-medium text-gray-700 mb-2">Устройства</label>
              <div v-if="inputDevices.length > 0" class="flex flex-wrap gap-1">
                <BaseButton
                  v-for="device in inputDevices"
                  :key="device.name"
                  variant="blue"
                  size="sm"
                  :title="`${categoryIcons[device.device_type]} ${device.name}`"
                  @click="selectDevice(rule, device.name)"
                >
                  <span class="mr-1">{{ categoryIcons[device.device_type] }}</span>
                  {{ device.name.length > 35 ? device.name.slice(0, 35) + '...' : device.name }}
                </BaseButton>
              </div>
            </div>
            
            <div>
              <label class="text-sm font-medium text-gray-700 mb-2">Conditions</label>
              <div class="flex flex-col gap-2">
                <div 
                  v-for="(cond, condIndex) in getConditionsArray(rule)" 
                  :key="condIndex"
                  class="flex items-center gap-2 p-2 bg-gray-50 rounded"
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
                    <span class="text-gray-400">==</span>
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
                    <span class="text-gray-400 text-sm italic">(boolean)</span>
                  </template>
                  <button class="delete-btn" @click="removeCondition(rule, condIndex)">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2.5 3.5H11.5M5 3.5V2.5C5 2.22386 5.22386 2 5.5 2H8.5C8.77614 2 9 2.22386 9 2.5V3.5M6 6.5V10.5M8 6.5V10.5M3 3.5L3.5 11.5C3.5 11.7761 3.72386 12 4 12H10C10.2761 12 10.5 11.7761 10.5 11.5L11 3.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div class="mt-2">
                <BaseButton variant="blue" size="sm" @click="addCondition(rule)">
                  <template #icon-left>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                  </template>
                  добавить условие
                </BaseButton>
              </div>
            </div>
            
            <div>
              <label class="text-sm font-medium text-gray-700 mb-2 block">Properties</label>
              <div class="grid grid-cols-2 gap-2">
                <div 
                  v-for="prop in DEVICE_PROPERTIES" 
                  :key="prop.key"
                  class="flex items-center gap-2 p-2 bg-gray-50 rounded"
                >
                  <BaseCheckbox
                    v-if="prop.type === 'boolean'"
                    :model-value="getPropertyValue(rule, prop.key) === true"
                    @update:model-value="(v) => setPropertyValue(rule, prop.key, v)"
                  />
                  <span class="text-sm text-gray-600 flex-1">{{ prop.label }}</span>
                  <BaseInput
                    v-if="prop.type === 'number'"
                    type="number"
                    :model-value="getPropertyValue(rule, prop.key) || ''"
                    class="w-24"
                    @update:model-value="(v) => setPropertyValue(rule, prop.key, Number(v))"
                  />
                  <FieldHelp>
                    <template #title>{{ prop.label }}</template>
                    {{ prop.description }}
                  </FieldHelp>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="mt-4">
        <BaseButton variant="blue" @click="addRule">
          <template #icon-left>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </template>
          Добавить правило
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
