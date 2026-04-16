<script setup lang="ts">
interface IProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'blue' | 'green' | 'amber' | 'red' | 'icon'
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

const variantClass: Record<string, string> = {
  primary: 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 active:scale-95 border-none',
  secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400 active:scale-95 border-none',
  danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 active:scale-95 border-none',
  ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 active:bg-gray-200 active:scale-95 border-none',
  blue: 'bg-blue-100 text-blue-600 hover:bg-blue-200 active:scale-95 border-none',
  green: 'bg-green-100 text-green-600 hover:bg-green-200 active:scale-95 border-none',
  amber: 'bg-amber-100 text-amber-600 hover:bg-amber-200 active:scale-95 border-none',
  red: 'bg-red-100 text-red-600 hover:bg-red-200 active:scale-95 border-none',
  icon: 'bg-transparent text-gray-500 hover:bg-red-100 hover:text-red-500 active:scale-90 w-6 h-6 rounded-full justify-center border-none'
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
    @click="emit('click', $event)"
  >
    <slot />
  </button>
</template>