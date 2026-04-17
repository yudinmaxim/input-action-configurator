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
      class="mod-btn"
      :class="isSelected(btn.value) ? 'mod-btn-selected' : ''"
      @click="toggleButton(btn.value)"
    >
      {{ btn.label }}
    </button>
  </div>
</template>

<style scoped>
.mod-btn {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid #d1d5db;
  background: #f9fafb;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s ease;
}

.mod-btn:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.mod-btn:active {
  transform: scale(0.95);
}

.mod-btn-selected {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.mod-btn-selected:hover {
  background: #2563eb;
  border-color: #2563eb;
}
</style>
