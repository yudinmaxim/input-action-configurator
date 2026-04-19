<script setup lang="ts">
import { ref, computed } from 'vue'

interface IProps {
  modelValue?: string | number | string[]
  options: Array<{ value: string | number; label: string }>
  label?: string
  placeholder?: string
  disabled?: boolean
  multiple?: boolean
  showValueInTitle?: boolean
  expanded?: boolean
}

const {
  modelValue = '',
  options = [],
  label = '',
  placeholder = '',
  disabled = false,
  multiple = false,
  showValueInTitle = true,
  expanded = false
} = defineProps<IProps>()

const isOpen = ref(false)

const widthClass = computed(() => expanded ? 'w-full' : 'w-fit')

const emit = defineEmits<{
  'update:modelValue': [value: string | string[]]
}>()

const selectedLabel = computed(() => {
  const selected = options.find(o => o.value === modelValue)
  return selected?.label || ''
})

const selectTitle = computed(() => {
  if (!showValueInTitle) return ''
  return selectedLabel.value || placeholder
})
</script>

<template>
  <div class="flex flex-col gap-1" :class="widthClass">
    <label v-if="label" class="text-sm font-medium text-gray-700">{{ label }}</label>
    <template v-if="multiple">
      <div class="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md min-h-[42px]">
        <label
          v-for="option in options"
          :key="option.value"
          class="flex items-center gap-1 cursor-pointer text-sm"
        >
          <input
            type="checkbox"
            :checked="(modelValue as string[] || []).includes(String(option.value))"
            :value="option.value"
            :disabled="disabled"
            class="rounded border-gray-300"
            @change="(e) => {
              const checked = (e.target as HTMLInputElement).checked
              const current = (modelValue as string[] || []).map(String)
              const val = String(option.value)
              const newVal = checked 
                ? [...current, val]
                : current.filter(v => v !== val)
              emit('update:modelValue', newVal as any)
            }"
          />
          {{ option.label }}
        </label>
      </div>
    </template>
    <div class="relative">
      <select
        :value="modelValue"
        :disabled="disabled"
        :title="selectTitle"
        class="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md text-base text-gray-800 bg-white transition-colors cursor-pointer hover:border-gray-400 outline-none appearance-none"
        :class="[disabled && 'bg-gray-50 cursor-not-allowed opacity-50']"
        @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
        @focus="isOpen = true"
        @blur="isOpen = false"
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
      <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
        <slot name="append" />
        <svg 
          class="w-4 h-4 text-gray-400 pointer-events-none transition-transform duration-200"
          :class="[isOpen && 'rotate-180']"
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2"
        >
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </div>
    </div>
  </div>
</template>
