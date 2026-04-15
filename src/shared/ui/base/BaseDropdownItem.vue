<script setup lang="ts">
import { inject } from 'vue'

interface IProps {
  value: string | number
  label?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<IProps>(), {
  disabled: false
})

const handleSelect = inject<(value: string | number) => void>('handleSelect')

const handleClick = () => {
  if (props.disabled || !handleSelect) return
  handleSelect(props.value)
}
</script>

<template>
  <button
    class="dropdown-item w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    :disabled="disabled"
    @click="handleClick"
  >
    <slot>
      {{ label }}
    </slot>
  </button>
</template>

<style scoped>
.dropdown-item:first-child {
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
}

.dropdown-item:last-child {
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
}

.dropdown-item:not(:last-child) {
  border-bottom: 1px solid #f3f4f6;
}
</style>
