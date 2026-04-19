<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useConfigStore } from '../../shared/lib/stores/config'
import { DeviceRule } from '../../shared/lib/types'
import { BaseInput, BaseSelect, BaseCheckbox, BaseButton } from '../../shared/ui/base'
import FieldHelp from '../../shared/ui/base/FieldHelp.vue'
import { getInputDevices, type InputDevice } from '../../shared/api/config'

const { t: $t } = useI18n()

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
  if (newDevice && rules.value.length > 0) {
    editingIndex.value = 0
  }
}, { immediate: true })

const categoryIcons: Record<string, string> = {
  keyboard: '⌨️',
  mouse: '🖱️',
  touchpad: '👆',
  touchscreen: '📱'
}

const DEVICE_CONDITION_VARS = computed(() => {
  const hasDevices = inputDevices.value.length > 0
  const options = [
    { value: '$types', label: $t('deviceRules.condition.types') },
    { value: '$keyboard', label: $t('deviceRules.condition.keyboard') },
    { value: '$mouse', label: $t('deviceRules.condition.mouse') },
    { value: '$touchpad', label: $t('deviceRules.condition.touchpad') },
    { value: '$touchscreen', label: $t('deviceRules.condition.touchscreen') },
  ]
  // $name (выбор устройства) - только если есть устройства
  if (hasDevices) {
    options.unshift({ value: '$name_select', label: $t('deviceRules.condition.nameSelect') })
  }
  // $name (свободный ввод) - всегда доступно
  options.unshift({ value: '$name_free', label: $t('deviceRules.condition.nameFree') })
  return options
})

const getConditionVarType = (condition: string): string => {
  const parsed = parseCondition(condition)
  if (parsed.var === '$name') {
    // Проверяем, был ли указан тип в исходной строке
    const rawStr = String(condition)
    if (rawStr.startsWith('$name_select')) {
      return '$name_select'
    }
    if (rawStr.startsWith('$name_free')) {
      return '$name_free'
    }
    // Определяем по наличию оператора и значения
    if (parsed.op === '==' && parsed.value) {
      return '$name_select'
    }
    return '$name_free'
  }
  return parsed.var
}

const DEVICE_PROPERTIES = computed(() => [
  { key: 'ignore', label: $t('deviceRules.property.ignore.label'), description: $t('deviceRules.property.ignore.description'), type: 'boolean' },
  { key: 'grab', label: $t('deviceRules.property.grab.label'), description: $t('deviceRules.property.grab.description'), type: 'boolean' },
  { key: 'buttonpad', label: $t('deviceRules.property.buttonpad.label'), description: $t('deviceRules.property.buttonpad.description'), type: 'boolean' },
  { key: 'handle_evdev_events', label: $t('deviceRules.property.handle_evdev_events.label'), description: $t('deviceRules.property.handle_evdev_events.description'), type: 'boolean' },
  { key: 'motion_timeout', label: $t('deviceRules.property.motion_timeout.label'), description: $t('deviceRules.property.motion_timeout.description'), type: 'number' },
  { key: 'motion_threshold', label: $t('deviceRules.property.motion_threshold.label'), description: $t('deviceRules.property.motion_threshold.description'), type: 'number' },
  { key: 'motion_threshold_2', label: $t('deviceRules.property.motion_threshold_2.label'), description: $t('deviceRules.property.motion_threshold_2.description'), type: 'number' },
  { key: 'motion_threshold_3', label: $t('deviceRules.property.motion_threshold_3.label'), description: $t('deviceRules.property.motion_threshold_3.description'), type: 'number' },
  { key: 'press_timeout', label: $t('deviceRules.property.press_timeout.label'), description: $t('deviceRules.property.press_timeout.description'), type: 'number' },
  { key: 'click_timeout', label: $t('deviceRules.property.click_timeout.label'), description: $t('deviceRules.property.click_timeout.description'), type: 'number' },
  { key: 'unblock_buttons_on_timeout', label: $t('deviceRules.property.unblock_buttons_on_timeout.label'), description: $t('deviceRules.property.unblock_buttons_on_timeout.description'), type: 'boolean' },
])

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
  // Сохраняем тип в строку условия
  if (parsed.var === '$name_select') {
    if (!parsed.op && !parsed.value) {
      return '$name_select'
    }
    return `$name_select == ${parsed.value}`
  }
  if (parsed.var === '$name_free') {
    if (!parsed.op && !parsed.value) {
      return '$name_free'
    }
    return `$name_free == ${parsed.value}`
  }
  
  if (!parsed.op && !parsed.value) {
    return parsed.var
  }
  if (parsed.var === '$types') {
    if (parsed.op === 'contains') {
      return `${parsed.var} ${parsed.op} ${parsed.value}`
    }
    return `${parsed.var} == ${parsed.value}`
  }
  return parsed.var
}

const getRuleDescription = (rule: DeviceRule): string => {
  if (!rule.conditions || !Array.isArray(rule.conditions) || rule.conditions.length === 0) {
    return $t('deviceRules.noConditions')
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
  // Проверяем, есть ли ещё доступные устройства для выбора
  const selectedDevices = getSelectedDevices(rule)
  const availableDevices = inputDevices.value.filter(d => !selectedDevices.includes(d.name))
  
  if (availableDevices.length > 0) {
    // Выбираем первое доступное устройство
    const firstDevice = availableDevices[0].name
    ;(rule.conditions as any[]).push(`$name_select == ${firstDevice}`)
  } else {
    ;(rule.conditions as any[]).push('$name_free == ')
  }
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

const getSelectedDevices = (rule: DeviceRule, excludeIndex?: number): string[] => {
  const conditions = getConditionsArray(rule)
  const selected: string[] = []
  conditions.forEach((cond, index) => {
    if (excludeIndex !== undefined && index === excludeIndex) return
    const parsed = parseCondition(String(cond))
    // Проверяем и $name (старый формат), и $name_select (новый формат)
    if ((parsed.var === '$name' || parsed.var === '$name_select') && parsed.value) {
      selected.push(parsed.value)
    }
  })
  return selected
}

const needsValue = (condition: any): boolean => {
  const parsed = parseCondition(String(condition))
  const varType = getConditionVarType(String(condition))
  // Boolean условия (не требуют значения)
  const booleanVars = ['$keyboard', '$mouse', '$touchpad', '$touchscreen']
  // Для $name_free и $name_select всегда нужно значение
  if (varType === '$name_free' || varType === '$name_select') {
    return true
  }
  return !booleanVars.includes(parsed.var)
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
        <p class="text-gray-500">{{ $t('deviceRules.noRules') }}</p>
        <p class="text-sm text-gray-400 mt-1">{{ $t('device.createFirst') }}</p>
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
                {{ $t('deviceRules.rule') }} #{{ index + 1 }}
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
                {{ rule.ignore ? $t('deviceRules.ignore') : $t('deviceRules.active') }}
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
              <label class="text-sm font-medium text-gray-700 mb-2">{{ $t('labels.conditions') }}</label>
              <div class="flex flex-col gap-2">
                <div 
                  v-for="(cond, condIndex) in getConditionsArray(rule)" 
                  :key="condIndex"
                  class="flex items-center gap-2 p-2 bg-gray-50 rounded"
                >
                  <BaseSelect
                    :model-value="getConditionVarType(String(cond))"
                    :options="[...DEVICE_CONDITION_VARS]"
                    class="w-40"
                    @update:model-value="(v) => {
                      const parsed = parseCondition(String(cond))
                      if (v === '$name_select') {
                        parsed.var = '$name_select'
                        parsed.op = '=='
                        parsed.value = ''
                      } else if (v === '$name_free') {
                        parsed.var = '$name_free'
                        parsed.op = '=='
                        parsed.value = ''
                      } else {
                        parsed.var = v as string
                        parsed.op = ''
                        parsed.value = ''
                      }
                      updateConditionRaw(rule, condIndex, serializeCondition(parsed))
                    }"
                  />
                  <template v-if="needsValue(cond)">
                    <span class="text-gray-400">==</span>
                    <BaseSelect
                      v-if="getConditionVarType(String(cond)) === '$name_select'"
                      :model-value="parseCondition(String(cond)).value"
                      :options="inputDevices
                        .filter(d => {
                          const selectedDevices = getSelectedDevices(rule, condIndex)
                          return d.name === parseCondition(String(cond)).value || !selectedDevices.includes(d.name)
                        })
                        .map(d => ({ value: d.name, label: `${categoryIcons[d.device_type]} ${d.name}` }))"
                      class="flex-1"
                      @update:model-value="(v) => {
                        const parsed = parseCondition(String(cond))
                        parsed.var = '$name_select'
                        parsed.value = v as string
                        updateConditionRaw(rule, condIndex, serializeCondition(parsed))
                      }"
                    />
                    <BaseInput
                      v-else
                      :model-value="parseCondition(String(cond)).value"
                      :placeholder="$t('form.placeholder')"
                      class="flex-1"
                      expanded
                      @update:model-value="(v) => {
                        const parsed = parseCondition(String(cond))
                        parsed.var = '$name_free'
                        parsed.value = v as string
                        updateConditionRaw(rule, condIndex, serializeCondition(parsed))
                      }"
                    />
                  </template>
                  <template v-else>
                    <span class="text-gray-400 text-sm italic">{{ $t('deviceRules.boolean') }}</span>
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
                  {{ $t('deviceRules.addCondition') }}
                </BaseButton>
              </div>
            </div>
            
            <div>
              <label class="text-sm font-medium text-gray-700 mb-2 block">{{ $t('labels.properties') }}</label>
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
          {{ $t('deviceRules.addRule') }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
