<script setup lang="ts">
interface IProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'blue' | 'green' | 'amber' | 'red'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  fullWidth?: boolean
}

const {
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false
} = defineProps<IProps>()

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const handleClick = (event: MouseEvent) => {
  emit('click', event)
}

const variantClass: Record<string, string> = {
  primary: 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 active:scale-95 border-none',
  secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400 active:scale-95 border-none',
  danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 active:scale-95 border-none',
  ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 active:bg-gray-200 active:scale-95 border-none',
  blue: 'bg-blue-100 text-blue-600 hover:bg-blue-200 active:scale-95 border-none',
  green: 'bg-green-100 text-green-600 hover:bg-green-200 active:scale-95 border-none',
  amber: 'bg-amber-100 text-amber-600 hover:bg-amber-200 active:scale-95 border-none',
  red: 'bg-red-100 text-red-600 hover:bg-red-200 active:scale-95 border-none',
}

const sizeClass = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg'
}
</script>

<template>
  <button
    class="inline-flex justify-center items-center rounded-md font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    :class="[variantClass[variant], sizeClass[size], fullWidth ? 'w-full' : '']"
    :disabled="disabled"
    @click="handleClick"
  >
    <span class="icon-left"><slot name="icon-left" /></span>
    <slot />
    <span class="icon-right"><slot name="icon-right" /></span>
  </button>
</template>

<style scoped>
button :deep(svg) {
  width: 1em;
  height: 1em;
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
}

.icon-left :deep(svg) {
  margin-right: 0.5em;
}

.icon-right :deep(svg) {
  margin-left: 0.5em;
}

.icon-right {
  display: inline-flex;
  align-items: center;
  margin-left: 0.25em;
}

.icon-right :deep(.help-wrapper) {
  display: inline-flex;
  align-items: center;
}

.icon-right :deep(.help-btn) {
  width: 16px;
  height: 16px;
  font-size: 10px;
  margin-left: 0;
}
</style>
