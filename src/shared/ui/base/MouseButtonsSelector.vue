<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  modelValue?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => []
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const buttons = [
  { value: 'left', label: 'Left' },
  { value: 'middle', label: 'Middle' },
  { value: 'right', label: 'Right' },
  { value: 'back', label: 'Back' },
  { value: 'forward', label: 'Forward' },
  { value: 'extra', label: 'Extra' },
]

const selected = ref<string[]>([...props.modelValue])

watch(() => props.modelValue, (newVal) => {
  selected.value = [...newVal]
}, { deep: true })

const toggleButton = (btn: string) => {
  const index = selected.value.indexOf(btn)
  if (index === -1) {
    selected.value.push(btn)
  } else {
    if (selected.value.length > 1) {
      selected.value.splice(index, 1)
    }
  }
  emit('update:modelValue', selected.value)
}

const isSelected = (btn: string) => selected.value.includes(btn)
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="btn in buttons"
      :key="btn.value"
      class="px-2.5 py-1 rounded-md text-xs font-medium transition-all"
      :class="isSelected(btn.value) 
        ? 'px-2.5 py-1 rounded-md text-xs font-medium border border-blue-500 bg-blue-500 text-white hover:bg-blue-600 active:scale-95' 
        : 'px-2.5 py-1 rounded-md text-xs font-medium border border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:border-gray-400 active:scale-95'"
      @click="toggleButton(btn.value)"
    >
      {{ btn.label }}
    </button>
  </div>
</template>

<style scoped>
</style>
