<script setup lang="ts">
import BaseButton from './BaseButton.vue'
import BaseIconButton from './BaseIconButton.vue'

interface IProps {
  modelValue: boolean
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmVariant?: 'primary' | 'danger'
}

withDefaults(defineProps<IProps>(), {
  title: 'Подтверждение',
  confirmText: 'Да',
  cancelText: 'Отмена',
  confirmVariant: 'danger'
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm': []
  'cancel': []
}>()

const handleClose = () => {
  emit('update:modelValue', false)
  emit('cancel')
}

const handleConfirm = () => {
  emit('confirm')
  emit('update:modelValue', false)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="modelValue" 
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        @click.self="handleClose"
      >
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 class="text-lg font-semibold text-gray-800">{{ title }}</h3>
            <BaseIconButton variant="close" @click="handleClose">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </BaseIconButton>
          </div>
          <div class="px-6 py-4">
            <p class="text-gray-600">{{ message }}</p>
          </div>
          <div class="px-6 py-4 bg-gray-50 flex justify-end gap-3">
            <BaseButton variant="secondary" @click="handleClose">
              {{ cancelText }}
            </BaseButton>
            <BaseButton :variant="confirmVariant" @click="handleConfirm">
              {{ confirmText }}
            </BaseButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.2s ease;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95);
}
</style>
