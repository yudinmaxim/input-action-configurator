<script setup lang="ts">
import { ref } from 'vue'
import { BaseInput, BaseSelect, BaseCard } from '../../shared/ui/base'
import FieldHelp from '../../shared/ui/base/FieldHelp.vue'

interface GroupCondition {
  groupType: 'any' | 'all' | 'none'
  conditions: { variable: string, value: string }[]
}

interface SimpleCondition {
  variable: string
  value: string
}

type ConditionItem = GroupCondition | SimpleCondition

interface Props {
  selectedTrigger: any
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update-field': [field: string, value: unknown]
}>()

const list = ref<ConditionItem[]>([])

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

const TYPE_COLORS: Record<string, string> = {
  'condition': 'bg-blue-50 border-blue-200',
  'any': 'bg-green-50 border-green-200',
  'all': 'bg-amber-50 border-amber-200',
  'none': 'bg-red-50 border-red-200',
}

const TYPE_LABELS: Record<string, string> = {
  'condition': 'Простое условие',
  'any': 'Любое из списка',
  'all': 'Все из списка',
  'none': 'Ни одно из списка',
}

function isGroup(c: ConditionItem): c is GroupCondition {
  return 'groupType' in c
}

function isSimple(c: ConditionItem): c is SimpleCondition {
  return 'variable' in c && !('groupType' in c)
}

function syncList() {
  const raw = props.selectedTrigger?.conditions || []
  list.value = parseConditions(raw)
}

function parseConditions(raw: any[]): ConditionItem[] {
  return raw.map((item: any) => {
    if (typeof item === 'string') {
      const match = item.match(/^\$?(\w+)\s*==\s*(.+)$/)
      if (match) return { variable: match[1], value: match[2] }
      return { variable: item, value: '' }
    }
    if (typeof item === 'object' && item !== null) {
      if (item.any) return { groupType: 'any' as const, conditions: parseSub(item.any) }
      if (item.all) return { groupType: 'all' as const, conditions: parseSub(item.all) }
      if (item.none) return { groupType: 'none' as const, conditions: parseSub(item.none) }
    }
    return { variable: '', value: '' }
  })
}

function parseSub(raw: any[]): { variable: string, value: string }[] {
  return raw.map((item: string) => {
    const match = String(item).match(/^\$?(\w+)\s*==\s*(.+)$/)
    return match ? { variable: match[1], value: match[2] } : { variable: String(item), value: '' }
  })
}

function serialize(): any[] {
  return list.value.map(c => {
    if (isGroup(c)) {
      const subs = c.conditions.filter(x => x.variable && x.value).map(x => `${x.variable} == ${x.value}`)
      if (c.groupType === 'any') return { any: subs }
      if (c.groupType === 'all') return { all: subs }
      if (c.groupType === 'none') return { none: subs }
    }
    if (isSimple(c) && c.variable && c.value) return `${c.variable} == ${c.value}`
    if (isSimple(c) && c.variable) return c.variable
    return ''
  }).filter(Boolean)
}

function saveConditions() {
  const serialized = serialize()
  emit('update-field', 'conditions', serialized.length ? serialized : undefined)
}

syncList()

const doAddSimple = () => {
  list.value.push({ variable: '', value: '' })
  saveConditions()
}

const doAddGroup = (type: 'any' | 'all' | 'none') => {
  list.value.push({ groupType: type, conditions: [{ variable: '', value: '' }] })
  saveConditions()
}

const remove = (i: number) => {
  list.value.splice(i, 1)
  saveConditions()
}

const onVar = (i: number, v: string | string[]) => {
  const value = Array.isArray(v) ? v[0] : v
  if (isSimple(list.value[i])) {
    (list.value[i] as SimpleCondition).variable = value
    saveConditions()
  }
}

const onVal = (i: number, v: string) => {
  if (isSimple(list.value[i])) {
    (list.value[i] as SimpleCondition).value = v
    saveConditions()
  }
}

const onSubVar = (i: number, subI: number, v: string | string[]) => {
  const value = Array.isArray(v) ? v[0] : v
  if (isGroup(list.value[i])) {
    list.value[i].conditions[subI].variable = value
    saveConditions()
  }
}

const onSubVal = (i: number, subI: number, v: string) => {
  if (isGroup(list.value[i])) {
    list.value[i].conditions[subI].value = v
    saveConditions()
  }
}

const addSub = (i: number) => {
  if (isGroup(list.value[i])) {
    list.value[i].conditions.push({ variable: '', value: '' })
    saveConditions()
  }
}

const removeSub = (i: number, subI: number) => {
  if (isGroup(list.value[i])) {
    list.value[i].conditions.splice(subI, 1)
    saveConditions()
  }
}

function getRootType(c: ConditionItem): string {
  if (isGroup(c)) return c.groupType
  return 'condition'
}

function getSimple(c: ConditionItem): SimpleCondition {
  return c as SimpleCondition
}

function getGroup(c: ConditionItem): GroupCondition {
  return c as GroupCondition
}

const helpText = `
conditions - условия активации

Формат: $variable == value

Типы групп:
any: [условие1, услове2] - любое из списка (OR)
all: [условие1, услове2] - все из списка (AND)
none: [условие1, услове2] - ни одно из списка (NOT)

Примеры вывода:
$window_class == firefox
$keyboard_modifiers == [shift]
any: [$window_class==firefox, $window_class==chrome]
`
</script>

<template>
  <BaseCard title="Conditions">
    <div class="flex flex-col gap-2">
      <div v-for="(c, i) in list" :key="i" 
        class="flex flex-col gap-2 p-3 rounded-lg border"
        :class="TYPE_COLORS[getRootType(c)]"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium" :class="{
            'text-blue-600': getRootType(c) === 'condition',
            'text-green-600': getRootType(c) === 'any',
            'text-amber-600': getRootType(c) === 'all',
            'text-red-600': getRootType(c) === 'none',
          }">{{ TYPE_LABELS[getRootType(c)] }}</span>
          <button class="text-red-500 text-sm" @click="remove(i)">✕</button>
        </div>
        
        <template v-if="isGroup(c)">
          <div class="flex flex-col gap-1">
            <div v-for="(sub, subI) in (getGroup(c).conditions || [])" :key="subI" class="flex gap-2">
              <BaseSelect
                :model-value="sub.variable || ''"
                :options="VARIABLES"
                placeholder="$var"
                class="w-40"
                @update:model-value="(v) => onSubVar(i, subI, v)"
              />
              <BaseInput
                :model-value="sub.value"
                placeholder="значение"
                class="flex-1"
                @update:model-value="(v) => onSubVal(i, subI, v)"
              />
              <button class="text-red-500 text-sm" @click="removeSub(i, subI)">✕</button>
            </div>
            <button class="text-xs text-blue-500 text-left" @click="addSub(i)">
              + добавить условие
            </button>
          </div>
        </template>
        
        <template v-else>
          <div class="flex items-end gap-2">
            <BaseSelect
              :model-value="getSimple(c).variable || ''"
              :options="VARIABLES"
              placeholder="$var"
              class="w-40"
              @update:model-value="(v) => onVar(i, v)"
            />
            <span class="text-gray-400">==</span>
            <BaseInput
              :model-value="getSimple(c).value"
              placeholder="значение"
              class="flex-1"
              @update:model-value="(v) => onVal(i, v)"
            />
          </div>
        </template>
      </div>
      
      <div class="flex flex-wrap gap-2">
        <FieldHelp class="text-sm">
          <template #title>Простое условие</template>
          Проверяет $переменная == значение
        </FieldHelp>
        <button 
          class="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md text-sm font-medium"
          @click="doAddSimple"
        >
          + condition
        </button>
        
        <FieldHelp class="text-sm">
          <template #title>Любое из списка</template>
          Активируется, если хотя бы одно выполняется
        </FieldHelp>
        <button 
          class="px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-md text-sm font-medium"
          @click="doAddGroup('any')"
        >
          + any
        </button>
        
        <FieldHelp class="text-sm">
          <template #title>Все из списка</template>
          Активируется только если все выполняются
        </FieldHelp>
        <button 
          class="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-md text-sm font-medium"
          @click="doAddGroup('all')"
        >
          + all
        </button>
        
        <FieldHelp class="text-sm">
          <template #title>Ни одно из списка</template>
          Активируется если ни одно не выполняется
        </FieldHelp>
        <button 
          class="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm font-medium"
          @click="doAddGroup('none')"
        >
          + none
        </button>
      </div>
      
      <FieldHelp><slot>{{ helpText }}</slot></FieldHelp>
    </div>
  </BaseCard>
</template>