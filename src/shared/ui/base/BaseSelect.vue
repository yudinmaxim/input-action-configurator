<script setup lang="ts">
interface IProps {
  modelValue?: string | number | string[]
  options: Array<{ value: string | number; label: string }>
  label?: string
  placeholder?: string
  disabled?: boolean
  multiple?: boolean
}

const {
  modelValue = '',
  options = [],
  label = '',
  placeholder = '',
  disabled = false,
  multiple = false
} = defineProps<IProps>()

const emit = defineEmits<{
  'update:modelValue': [value: string | string[]]
}>()
</script>

<template>
  <div class="flex flex-col gap-1">
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
    <select
      v-else
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
