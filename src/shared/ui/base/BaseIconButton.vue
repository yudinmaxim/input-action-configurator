<script setup lang="ts">
interface Props {
  variant?: 'default' | 'icon' | 'delete' | 'app-select'
  disabled?: boolean
  title?: string
}

const {
  variant = 'default',
  disabled = false,
  title = ''
} = defineProps<Props>()

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const handleClick = (event: MouseEvent) => {
  if (!disabled) {
    emit('click', event)
  }
}
</script>

<template>
  <button
    class="inline-flex items-center justify-center rounded"
    :class="{
      // Default - универсальная кнопка-иконка
      'w-6 h-6 text-gray-400 hover:text-gray-600 active:scale-90': variant === 'default' && !disabled,
      
      // Icon - для App.vue (большая с фоном)
      'w-8 h-8 text-gray-700 hover:bg-gray-200 active:scale-95': variant === 'icon' && !disabled,
      
      // Delete - красная при наведении
      'w-6 h-6 text-gray-400 hover:text-red-500 active:scale-90': variant === 'delete' && !disabled,
      
      // App select - выбор окна
      'w-6 h-6 bg-gray-200 text-gray-600 hover:bg-gray-300 active:scale-90': variant === 'app-select' && !disabled,
      
      // Disabled states
      'opacity-40 cursor-not-allowed': disabled,
    }"
    :disabled="disabled"
    :title="title"
    @click="handleClick"
  >
    <slot />
  </button>
</template>
