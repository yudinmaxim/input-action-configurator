<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { BaseButton } from '../../shared/ui/base'
import { 
  checkInstalled, 
  checkServiceRunning, 
  installDetector,
  getActiveWindow
} from '../../entities/window-detector'

defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'select': [value: string]
}>()

const isPicking = ref(false)
const isInstalling = ref(false)
const statusMessage = ref<string | null>(null)
const error = ref<string | null>(null)
const isReady = ref(false)

onMounted(async () => {
  const installed = await checkInstalled()
  const running = await checkServiceRunning()
  isReady.value = installed && running
  
  if (!installed) {
    statusMessage.value = 'FocusNotifier не установлен. Нажмите "Установить" для продолжения.'
  } else if (!running) {
    statusMessage.value = 'Служба FocusNotifier не запущена. Нажмите "Установить" для запуска.'
  }
})

const install = async () => {
  isInstalling.value = true
  statusMessage.value = null
  error.value = null
  
  try {
    const result = await installDetector()
    if (result.success) {
      isReady.value = true
      statusMessage.value = 'Готово! Теперь нажмите "Выбрать окно" и кликните по нужному приложению.'
    } else {
      error.value = result.error || 'Ошибка установки'
    }
  } catch (e) {
    error.value = String(e)
  } finally {
    isInstalling.value = false
  }
}

const pickFromScreen = async () => {
  if (!isReady.value) {
    await install()
    return
  }
  
  isPicking.value = true
  error.value = null
  statusMessage.value = 'Кликните по нужному окну...'
  
  await new Promise(resolve => setTimeout(resolve, 500))
  
  try {
    const window = await getActiveWindow()
    
    if (window.class) {
      emit('select', window.class)
      emit('update:modelValue', false)
    } else {
      error.value = 'Не удалось определить активное окно. Убедитесь, что FocusNotifier работает.'
    }
  } catch (e) {
    error.value = String(e)
  } finally {
    isPicking.value = false
  }
}

const close = () => {
  emit('update:modelValue', false)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="modelValue" 
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        @click.self="close"
      >
        <div class="bg-white rounded-lg shadow-xl w-[400px] overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 class="text-lg font-semibold text-gray-800">Выбрать приложение</h3>
            <button class="text-gray-400 hover:text-gray-600" @click="close">✕</button>
          </div>
          
          <div class="px-6 py-6 flex flex-col gap-4">
            <p class="text-sm text-gray-600 text-center">
              Выберите приложение, для которого будет работать триггер.
            </p>
            
            <div v-if="statusMessage" class="text-sm text-blue-600 text-center p-2 bg-blue-50 rounded">
              {{ statusMessage }}
            </div>
            
            <div v-if="error" class="text-sm text-red-500 text-center p-2 bg-red-50 rounded">
              {{ error }}
            </div>
            
            <BaseButton
              v-if="!isReady"
              variant="primary"
              class="w-full"
              :disabled="isInstalling"
              @click="install"
            >
              {{ isInstalling ? 'Установка...' : '📦 Установить FocusNotifier' }}
            </BaseButton>
            
            <BaseButton
              variant="primary"
              class="w-full"
              :disabled="isPicking"
              @click="pickFromScreen"
            >
              {{ isPicking ? 'Кликните по окну...' : '🖱️ Выбрать активное окно' }}
            </BaseButton>
            
            <p class="text-xs text-gray-400 text-center">
              Требуется KDE Plasma с KWin. Работает на Wayland и X11.
            </p>
          </div>
          
          <div class="px-6 py-4 bg-gray-50 flex justify-end">
            <BaseButton variant="ghost" @click="close">
              Отмена
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
</style>
