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
      class="transition-all"
      :class="isSelected(mod) 
        ? 'px-2.5 py-1 rounded-md text-xs font-medium border border-blue-500 bg-blue-500 text-white hover:bg-blue-600 active:scale-95' 
        : 'px-2.5 py-1 rounded-md text-xs font-medium border border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:border-gray-400 active:scale-95'"
      @click="toggleModifier(mod)"
    >
      {{ mod }}
    </button>
  </div>
</template>

<style scoped>
</style>
