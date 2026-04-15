<script setup lang="ts">
import { ref, onMounted, onUnmounted, provide } from 'vue'

interface IProps {
  modelValue?: string | number
  disabled?: boolean
  placement?: 'bottom' | 'top' | 'left' | 'right'
}

const props = withDefaults(defineProps<IProps>(), {
  modelValue: '',
  disabled: false,
  placement: 'bottom'
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  'open': []
  'close': []
  'select': [value: string | number]
}>()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLElement | null>(null)

const toggle = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  emit(isOpen.value ? 'open' : 'close')
}

const open = () => {
  if (props.disabled) return
  isOpen.value = true
  emit('open')
}

const close = () => {
  isOpen.value = false
  emit('close')
}

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    close()
  }
}

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value) {
    close()
  }
}

const handleSelect = (value: string | number) => {
  emit('select', value)
  close()
}

// Provide close function for dropdown items
provide('closeDropdown', close)
provide('handleSelect', handleSelect)

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscape)
})

// Expose methods
defineExpose({
  open,
  close,
  toggle
})
</script>

<template>
  <div class="dropdown relative inline-block" ref="dropdownRef">
    <div 
      ref="triggerRef"
      class="dropdown-trigger cursor-pointer"
      @click="toggle"
    >
      <slot name="trigger" />
    </div>
    
    <Transition name="dropdown">
      <div 
        v-if="isOpen"
        class="dropdown-menu absolute z-50 bg-white border border-gray-200 rounded-md shadow-lg"
        :class="{
          'mt-1': placement === 'bottom',
          'mb-1': placement === 'top',
          'ml-1': placement === 'left',
          'mr-1': placement === 'right'
        }"
      >
        <slot />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
  transform-origin: top;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.dropdown-menu {
  min-width: 160px;
}
</style>
