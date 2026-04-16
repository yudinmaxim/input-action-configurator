<script setup lang="ts">
interface IProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
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

const variantClass = {
  primary: 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 active:scale-95',
  secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400 active:scale-95',
  danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 active:scale-95',
  ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 active:bg-gray-200 active:scale-95'
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
    :class="[variantClass[variant as keyof typeof variantClass], sizeClass[size as keyof typeof sizeClass], fullWidth ? 'w-full' : '']"
    :disabled="disabled"
    @click="emit('click', $event)"
  >
    <slot />
  </button>
</template>