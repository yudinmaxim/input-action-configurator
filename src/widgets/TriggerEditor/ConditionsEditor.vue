<script setup lang="ts">
import { ref, watch } from 'vue'
import { BaseInput, BaseButton, BaseCard } from '../../shared/ui/base'
import FieldHelp from '../../shared/ui/base/FieldHelp.vue'

interface Props {
  selectedTrigger: any
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update-field': [field: string, value: unknown]
}>()

const conditionsList = ref<string[]>(props.selectedTrigger.conditions || [])
const showAddCondition = ref(false)

watch(conditionsList, () => {
  emit('update-field', 'conditions', conditionsList.value.length ? conditionsList.value : undefined)
}, { deep: true })

const addCondition = () => {
  conditionsList.value.push('')
  showAddCondition.value = false
}

const removeCondition = (i: number) => {
  conditionsList.value.splice(i, 1)
}

const helpText = `
conditions - условия активации триггера
end_conditions - условия завершения

Формат: \$переменная оператор значение

Примеры:
\$window_class == firefox
\$keyboard_modifiers == [ shift ]
\$fingers == 3

Группы any/all/none:
conditions:
  - any:
      - \$window_class == firefox
      - \$window_class == chrome
`
</script>

<template>
  <BaseCard title="Conditions">
    <div class="flex flex-col gap-3">
      <div v-for="(_, i) in conditionsList" :key="i" class="flex gap-2 items-center">
        <BaseInput
          v-model="conditionsList[i]"
          placeholder="$var == value"
          class="flex-1"
          @update:model-value="conditionsList[i] = $event"
        />
        <button
          class="text-red-500 hover:text-red-700 text-sm px-2"
          @click="removeCondition(i)"
        >
          ✕
        </button>
      </div>
      <div v-if="!showAddCondition">
        <BaseButton size="sm" variant="ghost" @click="showAddCondition = true">
          + Add condition
        </BaseButton>
      </div>
      <div v-else class="p-2 border rounded bg-gray-50">
        <BaseInput
          v-model="conditionsList[conditionsList.length]"
          placeholder="$window_class == firefox"
          class="mb-2"
        />
        <div class="text-xs text-gray-500 mb-2">
          Или: any: [...], all: [...], none: [...]
        </div>
        <div class="flex gap-2">
          <BaseButton size="sm" @click="addCondition">Add</BaseButton>
          <BaseButton size="sm" variant="ghost" @click="showAddCondition = false">Cancel</BaseButton>
        </div>
      </div>
      <FieldHelp>{{ helpText }}</FieldHelp>
    </div>
  </BaseCard>
</template>