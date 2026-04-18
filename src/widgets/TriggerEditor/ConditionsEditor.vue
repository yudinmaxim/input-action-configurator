<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { BaseInput, BaseSelect, BaseButton, BaseIconButton } from '../../shared/ui/base'
import FieldHelp from '../../shared/ui/base/FieldHelp.vue'
import ConditionGroup from '../../shared/ui/base/ConditionGroup.vue'
import KeyboardModifierToggles from './KeyboardModifierToggles.vue'
import { getActiveWindow } from '../../entities/window-detector'

const { t: $t } = useI18n()

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

const showCountdown = ref(false)
const countdown = ref(3)
const appSelectorIndex = ref<number | null>(null)
const appSelectorSubIndex = ref<number | null>(null)

let countdownInterval: ReturnType<typeof setInterval> | null = null

watch(() => props.selectedTrigger?.conditions, () => {
  syncList()
}, { deep: true })

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
      // Сохраняем все условия, даже пустые
      const subs = c.conditions.map(x => x.variable ? `${x.variable} == ${x.value}` : x.value)
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

onMounted(() => {
  syncList()
})

const doAddSimple = () => {
  list.value.push({ variable: '$window_class', value: '' })
  saveConditions()
}

const doAddGroup = (type: 'any' | 'all' | 'none') => {
  list.value.push({ groupType: type, conditions: [{ variable: '$window_class', value: '' }] })
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

const onSubVal = (i: number, subI: number, v: string) => {
  if (isGroup(list.value[i])) {
    list.value[i].conditions[subI].value = v
    saveConditions()
  }
}

const onGroupUpdate = (i: number, updatedGroup: GroupCondition) => {
  if (isGroup(list.value[i])) {
    list.value[i] = updatedGroup
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

const startCountdown = (index: number, subIndex: number | null = null) => {
  appSelectorIndex.value = index
  appSelectorSubIndex.value = subIndex
  showCountdown.value = true
  countdown.value = 3
  
  countdownInterval = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      if (countdownInterval) {
        clearInterval(countdownInterval)
        countdownInterval = null
      }
      showCountdown.value = false
      finishPicking()
    }
  }, 1000)
}

const cancelCountdown = () => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
    countdownInterval = null
  }
  showCountdown.value = false
  countdown.value = 3
  appSelectorIndex.value = null
  appSelectorSubIndex.value = null
}

const finishPicking = async () => {
  console.log('finishPicking started', { index: appSelectorIndex.value, subIndex: appSelectorSubIndex.value })
  const windowInfo = await getActiveWindow()
  console.log('windowInfo received', windowInfo)
  
  if (!appSelectorIndex.value && appSelectorIndex.value !== 0) {
    console.log('No index selected')
    appSelectorIndex.value = null
    appSelectorSubIndex.value = null
    return
  }
  
  const property = getWindowProperty(appSelectorIndex.value, appSelectorSubIndex.value)
  console.log('property to get:', property)
  const value = windowInfo[property as keyof typeof windowInfo]
  console.log('value:', value)
  
  if (value) {
    if (appSelectorSubIndex.value !== null) {
      onSubVal(appSelectorIndex.value, appSelectorSubIndex.value, value)
    } else {
      onVal(appSelectorIndex.value, value)
    }
  }
  
  appSelectorIndex.value = null
  appSelectorSubIndex.value = null
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
      <FieldHelp>{{ helpText }}</FieldHelp>
    </div>
    
    <div class="flex flex-col gap-2">
      <div v-for="(c, i) in list" :key="i">
        <ConditionGroup
          v-if="isGroup(c)"
          :model-value="getGroup(c)"
          @update:model-value="(v) => onGroupUpdate(i, v)"
          @delete="remove(i)"
          @pick-window="(subI) => startCountdown(i, subI)"
        />
        <div
          v-else
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
            <BaseIconButton variant="delete" @click="remove(i)">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 3.5H11.5M5 3.5V2.5C5 2.22386 5.22386 2 5.5 2H8.5C8.77614 2 9 2.22386 9 2.5V3.5M6 6.5V10.5M8 6.5V10.5M3 3.5L3.5 11.5C3.5 11.7761 3.72386 12 4 12H10C10.2761 12 10.5 11.7761 10.5 11.5L11 3.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </BaseIconButton>
          </div>
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
            <BaseIconButton 
              v-if="WINDOW_VARIABLES.includes(getSimple(c).variable)"
              variant="app-select"
              :title="$t('conditionGroup.pickWindow')"
              @click="startCountdown(i)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="3" width="20" height="14" rx="2"/>
<path d="M8 21h8M12 17v4"/>
              </svg>
            </BaseIconButton>
          </div>
        </div>
      </div>
      
      <div class="flex flex-wrap gap-2">
        <BaseButton variant="blue" :title="$t('conditions.simple')" @click="doAddSimple">
          <template #icon-left>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </template>
          condition
        </BaseButton>
        
        <BaseButton variant="green" :title="$t('conditions.any')" @click="doAddGroup('any')">
          <template #icon-left>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </template>
          any
        </BaseButton>
        
        <BaseButton variant="amber" :title="$t('conditions.all')" @click="doAddGroup('all')">
          <template #icon-left>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </template>
          all
        </BaseButton>
        
        <BaseButton variant="red" :title="$t('conditions.none')" @click="doAddGroup('none')">
          <template #icon-left>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </template>
          none
        </BaseButton>
      </div>
    </div>
    
    <Teleport to="body">
      <Transition name="fade">
        <div 
          v-if="showCountdown"
          class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 cursor-pointer"
          @click="cancelCountdown"
        >
          <div class="text-9xl font-bold text-white mb-8">
            {{ countdown }}
          </div>
          <div class="text-xl text-gray-300 mb-4">
            Переключитесь на нужное окно
          </div>
          <div class="text-sm text-gray-500">
            Кликните в любое место для отмены
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>