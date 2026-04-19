<script setup lang="ts">
import { computed } from 'vue'

interface IProps {
  modelValue?: string | number
  type?: string
  placeholder?: string
  label?: string
  hint?: string
  error?: string
  disabled?: boolean
  expanded?: boolean
  iconsOverlay?: boolean
}

const {
  modelValue = '',
  type = 'text',
  placeholder = '',
  label = '',
  hint = '',
  error = '',
  disabled = false,
  expanded = false,
  iconsOverlay = false
} = defineProps<IProps>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'blur': [value: string]
}>()

const widthClass = computed(() => expanded ? 'w-full' : 'w-fit')
</script>

<template>
  <div class="flex flex-col gap-1" :class="widthClass">
    <label v-if="label" class="text-sm font-medium text-gray-700 flex items-center gap-1">
      {{ label }}
      <slot name="label-before" />
    </label>
    <div
      class="relative flex border-1 border-solid rounded bg-white transition-colors"
      :class="[
        widthClass,
        error ? 'border-red-500' : 'border-gray-200',
        disabled ? 'bg-gray-50 cursor-not-allowed opacity-50' : 'hover:border-gray-300'
      ]"
    >
      <input
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        class="w-full px-3 py-2 text-base text-gray-800 bg-transparent outline-none border-none truncate"
        :class="[
          disabled ? 'cursor-not-allowed' : ''
        ]"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @blur="emit('blur', ($event.target as HTMLInputElement).value)"
      />
      <div 
        v-if="$slots.append" 
        class="flex items-center mr-3"
      >
        <slot name="append" />
      </div>
    </div>
    <span v-if="error" class="text-sm text-red-500">{{ error }}</span>
    <span v-else-if="hint" class="text-xs text-gray-500">{{ hint }}</span>
  </div>
</template>