<script setup lang="ts">
interface IProps {
  modelValue?: string | number
  options: Array<{ value: string | number; label: string }>
  label?: string
  placeholder?: string
  disabled?: boolean
}

const {
  modelValue = '',
  options = [],
  label = '',
  placeholder = '',
  disabled = false
} = defineProps<IProps>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" class="text-sm font-medium text-gray-700">{{ label }}</label>
    <select
      :value="modelValue"
      :disabled="disabled"
      class="px-3 py-2 border border-gray-300 rounded-md text-base text-gray-800 bg-white transition-colors cursor-pointer hover:border-gray-400 focus:border-blue-500 outline-none"
      :class="[disabled && 'bg-gray-50 cursor-not-allowed opacity-50']"
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
  </div>
</template>
