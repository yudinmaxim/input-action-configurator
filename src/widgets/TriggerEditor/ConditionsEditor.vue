<script setup lang="ts">
import { ref, computed } from 'vue'
import { BaseInput, BaseSelect, BaseButton } from '../../shared/ui/base'
import FieldHelp from '../../shared/ui/base/FieldHelp.vue'
import KeyboardModifierToggles from './KeyboardModifierToggles.vue'
import AppSelectorModal from './AppSelectorModal.vue'

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

const showAppSelector = ref(false)
const appSelectorIndex = ref<number | null>(null)
const appSelectorSubIndex = ref<number | null>(null)

// Вычисляем модификаторы из условий
const keyboardModifiers = computed({
  get: () => {
    const modifierCondition = list.value.find(c => 
      isSimple(c) && c.variable === '$keyboard_modifiers'
    ) as SimpleCondition | undefined
    
    if (!modifierCondition?.value) return []
    
    // Парсим значение: "[ shift ]" или "[shift, ctrl]"
    const match = modifierCondition.value.match(/\[(.*?)\]/)
    if (!match) return []
    
    return match[1]
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
  },
  set: (newModifiers: string[]) => {
    const modifiersStr = newModifiers.length > 0 ? `[ ${newModifiers.join(', ')} ]` : ''
    
    // Находим или создаем условие для модификаторов
    const modifierIndex = list.value.findIndex(c => 
      isSimple(c) && c.variable === '$keyboard_modifiers'
    )
    
    if (newModifiers.length > 0) {
      if (modifierIndex !== -1) {
        // Обновляем существующее условие
        (list.value[modifierIndex] as SimpleCondition).value = modifiersStr
      } else {
        // Добавляем новое условие
        list.value.push({ variable: '$keyboard_modifiers', value: modifiersStr })
      }
    } else if (modifierIndex !== -1) {
      // Удаляем условие если модификаторов нет
      list.value.splice(modifierIndex, 1)
    }
    
    saveConditions()
  }
})

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

  console.log('Conditions parced list ', list.value)
}

const checkVariableName = (variable: string) => {
  if (variable.startsWith('$')) return variable

  return `$${variable}`
}

function parseConditions(raw: any[]): ConditionItem[] {
  return raw.map((item: any) => {
    if (typeof item === 'string') {
      // Поддерживаем: $var == value, var == value, $var == "value with spaces"
      const match = item.match(/^\$?([\w.-]+)\s*==\s*(.+)$/)
      if (match) return { variable: checkVariableName(match[1]), value: match[2].replace(/^["']|["']$/g, '') }
      return { variable: checkVariableName(item), value: '' }
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
    const str = String(item)
    const match = str.match(/^\$?([\w.-]+)\s*==\s*(.+)$/)
    return match 
      ? { variable: checkVariableName(match[1]), value: match[2].replace(/^["']|["']$/g, '') } 
      : { variable: checkVariableName(str), value: '' }
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

const openAppSelector = (index: number, subIndex: number | null = null) => {
  appSelectorIndex.value = index
  appSelectorSubIndex.value = subIndex
  showAppSelector.value = true
}

const getWindowProperty = (index: number, subIndex: number | null): 'class' | 'name' | 'caption' => {
  let variable = ''
  if (subIndex !== null && isGroup(list.value[index])) {
    variable = list.value[index].conditions[subIndex].variable
  } else if (isSimple(list.value[index])) {
    variable = (list.value[index] as SimpleCondition).variable
  }
  
  if (variable === '$window_class') return 'class'
  if (variable === '$window_name') return 'name'
  if (variable === '$window_title') return 'caption'
  return 'class'
}

const getConditionTitle = (type: string): string => {
  const titles: Record<string, string> = {
    condition: 'Простое условие',
    any: 'Любое из списка (OR)',
    all: 'Все из списка (AND)',
    none: 'Ни одно из списка (NOT)'
  }
  return titles[type] || type
}

const getConditionDescription = (type: string): string => {
  const descriptions: Record<string, string> = {
    condition: 'Проверяет $переменная == значение',
    any: 'Активируется, если хотя бы одно условие выполняется',
    all: 'Активируется только если все условия выполняются',
    none: 'Активируется если ни одно условие НЕ выполняется'
  }
  return descriptions[type] || ''
}

const onAppSelected = (className: string) => {
  if (appSelectorIndex.value !== null) {
    if (appSelectorSubIndex.value !== null) {
      onSubVal(appSelectorIndex.value, appSelectorSubIndex.value, className)
    } else {
      onVal(appSelectorIndex.value, className)
    }
    appSelectorIndex.value = null
    appSelectorSubIndex.value = null
  }
}

const WINDOW_VARIABLES = ['$window_class', '$window_name', '$window_title', '$screen_name']

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
  <div class="bg-white border border-gray-200 rounded-md p-4">
    <div class="flex items-center gap-2 mb-4">
      <h3 class="text-lg font-semibold text-gray-800">Conditions</h3>
      <FieldHelp><slot>{{ helpText }}</slot></FieldHelp>
    </div>
    
    <div class="flex flex-col gap-2">
        <div v-for="(c, i) in list" :key="i" 
          class="flex flex-col gap-2 p-3 rounded-lg border"
          :class="TYPE_COLORS[getRootType(c)]"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-xs font-medium" :class="{
                'text-blue-600': getRootType(c) === 'condition',
                'text-green-600': getRootType(c) === 'any',
                'text-amber-600': getRootType(c) === 'all',
                'text-red-600': getRootType(c) === 'none',
              }">{{ TYPE_LABELS[getRootType(c)] }}</span>
              <FieldHelp>
                <template #title>{{ getConditionTitle(getRootType(c)) }}</template>
                {{ getConditionDescription(getRootType(c)) }}
              </FieldHelp>
            </div>
            <button class="delete-btn" @click="remove(i)">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 3.5H11.5M5 3.5V2.5C5 2.22386 5.22386 2 5.5 2H8.5C8.77614 2 9 2.22386 9 2.5V3.5M6 6.5V10.5M8 6.5V10.5M3 3.5L3.5 11.5C3.5 11.7761 3.72386 12 4 12H10C10.2761 12 10.5 11.7761 10.5 11.5L11 3.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
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
                <BaseButton 
                  v-if="WINDOW_VARIABLES.includes(sub.variable)"
                  size="sm"
                  variant="secondary"
                  @click="openAppSelector(i, subI)"
                >
                  📱
                </BaseButton>
                <button class="delete-btn" @click="removeSub(i, subI)">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2.5 3.5H11.5M5 3.5V2.5C5 2.22386 5.22386 2 5.5 2H8.5C8.77614 2 9 2.22386 9 2.5V3.5M6 6.5V10.5M8 6.5V10.5M3 3.5L3.5 11.5C3.5 11.7761 3.72386 12 4 12H10C10.2761 12 10.5 11.7761 10.5 11.5L11 3.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
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
            <template v-if="getSimple(c).variable === '$keyboard_modifiers'">
              <KeyboardModifierToggles
                v-model="keyboardModifiers"
                class="flex-1"
              />
            </template>
            <BaseInput
              v-else
              :model-value="getSimple(c).value"
              placeholder="значение"
              class="flex-1"
              @update:model-value="(v) => onVal(i, v)"
            />
            <BaseButton 
              v-if="WINDOW_VARIABLES.includes(getSimple(c).variable)"
              size="sm"
              variant="secondary"
              @click="openAppSelector(i)"
            >
              📱
            </BaseButton>
          </div>
        </template>
      </div>
      
      <div class="flex flex-wrap gap-2">
        <button 
          class="add-btn add-btn-blue"
          @click="doAddSimple"
        >
          + condition
          <span @click.stop>
            <FieldHelp class="text-sm ml-1">
              <template #title>Простое условие</template>
              Проверяет $переменная == значение
            </FieldHelp>
          </span>
        </button>
        
        <button 
          class="add-btn add-btn-green"
          @click="doAddGroup('any')"
        >
          + any
          <span @click.stop>
            <FieldHelp class="text-sm ml-1">
              <template #title>Любое из списка</template>
              Активируется, если хотя бы одно выполняется
            </FieldHelp>
          </span>
        </button>
        
        <button 
          class="add-btn add-btn-amber"
          @click="doAddGroup('all')"
        >
          + all
          <span @click.stop>
            <FieldHelp class="text-sm ml-1">
              <template #title>Все из списка</template>
              Активируется только если все выполняются
            </FieldHelp>
          </span>
        </button>
        
        <button 
          class="add-btn add-btn-red"
          @click="doAddGroup('none')"
        >
          + none
          <span @click.stop>
            <FieldHelp class="text-sm ml-1">
              <template #title>Ни одно из списка</template>
              Активируется если ни одно не выполняется
            </FieldHelp>
          </span>
        </button>
      </div>
    </div>
    
    <AppSelectorModal
      v-model="showAppSelector"
      :window-property="getWindowProperty(appSelectorIndex ?? 0, appSelectorSubIndex)"
      @select="onAppSelected"
    />
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
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.delete-btn:active {
  transform: scale(0.9);
}

.add-btn {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  transition: all 0.15s ease;
}

.add-btn:active {
  transform: scale(0.95);
}

.add-btn-blue {
  background: #dbeafe;
  color: #2563eb;
}
.add-btn-blue:hover {
  background: #bfdbfe;
}

.add-btn-green {
  background: #dcfce7;
  color: #16a34a;
}
.add-btn-green:hover {
  background: #bbf7d0;
}

.add-btn-amber {
  background: #fef3c7;
  color: #d97706;
}
.add-btn-amber:hover {
  background: #fde68a;
}

.add-btn-red {
  background: #fee2e2;
  color: #dc2626;
}
.add-btn-red:hover {
  background: #fecaca;
}
</style>