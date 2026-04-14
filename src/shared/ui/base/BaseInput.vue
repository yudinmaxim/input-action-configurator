<script setup lang="ts">
interface IProps {
  modelValue?: string | number
  type?: string
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
}

const {
  modelValue = '',
  type = 'text',
  placeholder = '',
  label = '',
  error = '',
  disabled = false
} = defineProps<IProps>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" class="text-sm font-medium text-gray-700">{{ label }}</label>
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      class="px-3 py-2 border rounded-md text-base text-gray-800 bg-white transition-colors outline-none"
      :class="[
        error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500',
        disabled && 'bg-gray-50 cursor-not-allowed opacity-50'
      ]"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <span v-if="error" class="text-sm text-red-500">{{ error }}</span>
  </div>
</template>
