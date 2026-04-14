<script setup lang="ts">
interface IProps {
  modelValue?: boolean
  label?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<IProps>(), {
  modelValue: false,
  label: '',
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<template>
  <label class="inline-flex items-center gap-2 cursor-pointer">
    <input
      type="checkbox"
      :checked="props.modelValue"
      :disabled="props.disabled"
      class="w-4 h-4 text-blue-500 border-gray-300 rounded cursor-pointer"
      :class="[props.disabled && 'opacity-50 cursor-not-allowed']"
      @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    />
    <span v-if="props.label" class="text-base text-gray-700">{{ props.label }}</span>
  </label>
</template>