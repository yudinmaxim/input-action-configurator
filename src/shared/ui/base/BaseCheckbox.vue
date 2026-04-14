<script setup lang="ts">
interface IProps {
  modelValue?: boolean
  label?: string
  disabled?: boolean
}

const {
  modelValue = false,
  label = '',
  disabled = false
} = defineProps<IProps>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<template>
  <label class="inline-flex items-center gap-2 cursor-pointer">
    <input
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      class="w-4 h-4 text-blue-500 border-gray-300 rounded cursor-pointer"
      :class="[disabled && 'opacity-50 cursor-not-allowed']"
      @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    />
    <span v-if="label" class="text-base text-gray-700">{{ label }}</span>
  </label>
</template>
