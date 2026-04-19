<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { BaseSelect, BaseInput, BaseButton, BaseIconButton } from './index'
import FieldHelp from './FieldHelp.vue'
import KeyboardModifierToggles from '../../../widgets/TriggerEditor/KeyboardModifierToggles.vue'

const { t: $t } = useI18n()

interface SimpleCondition {
  variable: string
  value: string
}

interface GroupCondition {
  groupType: 'any' | 'all' | 'none'
  conditions: SimpleCondition[]
}

const VARIABLES = [
  { value: '$window_class', label: '$window_class' },
  { value: '$window_name', label: '$window_name' },
  { value: '$window_title', label: '$window_title' },
  { value: '$keyboard_modifiers', label: '$keyboard_modifiers' },
  { value: '$fingers', label: '$fingers' },
  { value: '$screen_name', label: '$screen_name' },
  { value: '$time_since_last_trigger', label: '$time_since_last_trigger' },
  { value: '$last_trigger_id', label: '$last_trigger_id' },
  { value: '$pointer_position_screen_percentage_x', label: '$pointer_position_x%' },
  { value: '$pointer_position_screen_percentage_y', label: '$pointer_position_y%' },
]

const WINDOW_VARIABLES = ['$window_class', '$window_name', '$window_title', '$screen_name']

const parseModifiers = (value: string): string[] => {
  if (!value) return []
  const match = value.match(/\[(.*?)\]/)
  if (!match) return []
  return match[1].split(',').map(s => s.trim()).filter(Boolean)
}

const serializeModifiers = (modifiers: string[]): string => {
  return modifiers.length > 0 ? `[ ${modifiers.join(', ')} ]` : ''
}

const TYPE_CONFIG = {
  any: {
    label: 'Любое из списка',
    title: 'Любое из списка (OR)',
    description: 'Активируется, если хотя бы одно условие выполняется',
    color: 'bg-green-50 border-green-200',
    badge: 'bg-green-100 text-green-700',
  },
  all: {
    label: 'Все из списка',
    title: 'Все из списка (AND)',
    description: 'Активируется только если все условия выполняются',
    color: 'bg-amber-50 border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
  },
  none: {
    label: 'Ни одно из списка',
    title: 'Ни одно из списка (NOT)',
    description: 'Активируется если ни одно условие не выполняется',
    color: 'bg-red-50 border-red-200',
    badge: 'bg-red-100 text-red-700',
  },
}

interface Props {
  modelValue: GroupCondition
  focusNotifierAvailable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  focusNotifierAvailable: true
})

const emit = defineEmits<{
  'update:modelValue': [value: GroupCondition]
  'delete': []
  'pickWindow': [conditionIndex: number]
}>()

const addCondition = () => {
  emit('update:modelValue', {
    ...props.modelValue,
    conditions: [...props.modelValue.conditions, { variable: '$window_class', value: '' }]
  })
}

const removeCondition = (index: number) => {
  emit('update:modelValue', {
    ...props.modelValue,
    conditions: props.modelValue.conditions.filter((_: any, i: number) => i !== index)
  })
}

const updateVariable = (index: number, variable: string) => {
  const newConditions = [...props.modelValue.conditions]
  newConditions[index] = { ...newConditions[index], variable, value: '' }
  emit('update:modelValue', { ...props.modelValue, conditions: newConditions })
}

const updateValue = (index: number, value: string) => {
  const newConditions = [...props.modelValue.conditions]
  newConditions[index] = { ...newConditions[index], value }
  emit('update:modelValue', { ...props.modelValue, conditions: newConditions })
}

const updateModifiers = (index: number, modifiers: string[]) => {
  updateValue(index, serializeModifiers(modifiers))
}

const config = computed(() => TYPE_CONFIG[props.modelValue.groupType])

const isWindowVariable = (variable: string) => WINDOW_VARIABLES.includes(variable)

const isKeyboardModifiers = (variable: string) => variable === '$keyboard_modifiers'

const getModifiers = (condition: SimpleCondition): string[] => {
  return parseModifiers(condition.value)
}
</script>

<template>
  <div class="rounded-lg border" :class="config.color">
    <div class="flex items-center justify-between p-3 border-b border-gray-200/50">
      <div class="flex items-center gap-2">
        <span class="text-xs font-medium px-2 py-1 rounded" :class="config.badge">
          {{ config.label }}
        </span>
        <FieldHelp>
          <template #title>{{ config.title }}</template>
          {{ config.description }}
        </FieldHelp>
      </div>
      <BaseIconButton variant="delete" @click="emit('delete')">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2.5 3.5H11.5M5 3.5V2.5C5 2.22386 5.22386 2 5.5 2H8.5C8.77614 2 9 2.22386 9 2.5V3.5M6 6.5V10.5M8 6.5V10.5M3 3.5L3.5 11.5C3.5 11.7761 3.72386 12 4 12H10C10.2761 12 10.5 11.7761 10.5 11.5L11 3.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </BaseIconButton>
    </div>
    
    <div class="p-3 space-y-2">
      <div 
        v-for="(condition, index) in modelValue.conditions" 
        :key="index"
        class="flex items-baseline gap-2"
      >
        <BaseSelect
          :model-value="condition.variable"
          :options="VARIABLES"
          placeholder="$var"
          class="w-40"
          @update:model-value="(v: string | string[]) => updateVariable(index, Array.isArray(v) ? v[0] : v)"
        />
        <span class="text-gray-400">==</span>
        
        <KeyboardModifierToggles
          v-if="isKeyboardModifiers(condition.variable)"
          :model-value="getModifiers(condition)"
          class="flex-1"
          @update:model-value="(v: string[]) => updateModifiers(index, v)"
        />
        <template v-else-if="isWindowVariable(condition.variable)">
          <BaseInput
            :model-value="condition.value"
            placeholder="значение"
            class="flex-1"
            expanded
            @update:model-value="(v: string) => updateValue(index, v)"
          />
          <BaseIconButton 
            v-if="focusNotifierAvailable"
            variant="app-select"
            :title="$t('conditionGroup.pickWindow')"
            @click="emit('pickWindow', index)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="3" width="20" height="14" rx="2"/>
              <path d="M8 21h8M12 17v4"/>
            </svg>
          </BaseIconButton>
        </template>
        <BaseInput
          v-else
          :model-value="condition.value"
          placeholder="значение"
          class="flex-1"
          expanded
          @update:model-value="(v: string) => updateValue(index, v)"
        />
        
        <BaseIconButton variant="delete" @click="removeCondition(index)">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2.5 3.5H11.5M5 3.5V2.5C5 2.22386 5.22386 2 5.5 2H8.5C8.77614 2 9 2.22386 9 2.5V3.5M6 6.5V10.5M8 6.5V10.5M3 3.5L3.5 11.5C3.5 11.7761 3.72386 12 4 12H10C10.2761 12 10.5 11.7761 10.5 11.5L11 3.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </BaseIconButton>
      </div>
      
      <BaseButton variant="blue" size="sm" @click="addCondition">
        <template #icon-left>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </template>
        добавить условие
      </BaseButton>
    </div>
  </div>
</template>

<style scoped>
</style>
