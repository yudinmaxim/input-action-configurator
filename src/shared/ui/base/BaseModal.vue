<script setup lang="ts">
interface IProps {
  modelValue: boolean
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmVariant?: 'primary' | 'danger'
}

const props = withDefaults(defineProps<IProps>(), {
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
            <button class="modal-close-btn" @click="handleClose">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          <div class="px-6 py-4">
            <p class="text-gray-600">{{ message }}</p>
          </div>
          <div class="px-6 py-4 bg-gray-50 flex justify-end gap-3">
            <button class="modal-btn modal-btn-cancel" @click="handleClose">
              {{ cancelText }}
            </button>
            <button class="modal-btn modal-btn-danger" @click="handleConfirm">
              {{ confirmText }}
            </button>
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

.modal-close-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.modal-close-btn:hover {
  background: rgba(148, 163, 184, 0.3);
  color: #374151;
}

.modal-close-btn:active {
  transform: scale(0.9);
}

.modal-btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.modal-btn:active {
  transform: scale(0.97);
}

.modal-btn-cancel {
  background: #f3f4f6;
  border-color: #d1d5db;
  color: #374151;
}

.modal-btn-cancel:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.modal-btn-danger {
  background: #fef2f2;
  border-color: #fecaca;
  color: #dc2626;
}

.modal-btn-danger:hover {
  background: #fee2e2;
  border-color: #fca5a5;
}
</style>
