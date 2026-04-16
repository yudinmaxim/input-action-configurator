<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  modelValue?: string[]
  modifiers?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  modifiers: () => ['ctrl', 'alt', 'shift', 'meta']
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const selected = ref<string[]>([...props.modelValue])

watch(() => props.modelValue, (newVal) => {
  selected.value = [...newVal]
}, { deep: true })

const toggleModifier = (mod: string) => {
  const index = selected.value.indexOf(mod)
  if (index === -1) {
    selected.value.push(mod)
  } else {
    selected.value.splice(index, 1)
  }
  emit('update:modelValue', selected.value)
}

const isSelected = (mod: string) => selected.value.includes(mod)
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="mod in modifiers"
      :key="mod"
      class="mod-btn"
      :class="isSelected(mod) ? 'mod-btn-selected' : ''"
      @click="toggleModifier(mod)"
    >
      {{ mod }}
    </button>
  </div>
</template>

<style scoped>
.mod-btn {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
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
