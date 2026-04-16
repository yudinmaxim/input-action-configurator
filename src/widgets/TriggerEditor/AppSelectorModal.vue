<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { BaseButton } from '../../shared/ui/base'
import { 
  checkInstalled, 
  checkServiceRunning, 
  installDetector,
  getActiveWindow
} from '../../entities/window-detector'

const props = defineProps<{
  modelValue: boolean
  windowProperty?: 'class' | 'name' | 'caption'
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'select': [value: string]
}>()

const propertyLabel = {
  class: 'класс окна',
  name: 'имя окна', 
  caption: 'заголовок окна'
}

const propertyExamples = {
  class: 'пример: firefox, chrome, jetbrains-webstorm',
  name: 'пример: Konsole, Dolphin, Chrome',
  caption: 'пример: Mozilla Firefox - Home'
}

const isPicking = ref(false)
const isInstalling = ref(false)
const showCountdown = ref(false)
const countdown = ref(3)
const statusMessage = ref<string | null>(null)
const error = ref<string | null>(null)
const isReady = ref(false)

let countdownInterval: ReturnType<typeof setInterval> | null = null

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

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
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

const startCountdown = () => {
  isPicking.value = true
  showCountdown.value = true
  countdown.value = 3
  error.value = null
  
  countdownInterval = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      if (countdownInterval) {
        clearInterval(countdownInterval)
        countdownInterval = null
      }
      showCountdown.value = false
      finishPicking()
    }
  }, 1000)
}

const cancelPicking = () => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
    countdownInterval = null
  }
  showCountdown.value = false
  isPicking.value = false
  countdown.value = 3
}

const finishPicking = async () => {
  try {
    const window = await getActiveWindow()
    const property = props.windowProperty || 'class'
    
    const value = window[property]
    
    if (value) {
      isPicking.value = false
      emit('select', value)
      emit('update:modelValue', false)
    } else {
      error.value = `Не удалось получить ${propertyLabel[property]}. Попробуйте ещё раз.`
      isPicking.value = false
    }
  } catch (e) {
    error.value = String(e)
    isPicking.value = false
  }
}

const close = () => {
  cancelPicking()
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
          </div>
          
          <div class="px-6 py-6 flex flex-col gap-4">
            <p class="text-sm text-gray-600 text-center">
              Выберите {{ propertyLabel[windowProperty || 'class'] }} для условия.
            </p>
            
            <p class="text-xs text-gray-400 text-center">
              {{ propertyExamples[windowProperty || 'class'] }}
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
              v-if="isReady"
              variant="primary"
              class="w-full"
              :disabled="isPicking"
              @click="startCountdown"
            >
              🖱️ Выбрать активное окно
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
    
    <Transition name="fade">
      <div 
        v-if="showCountdown"
        class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 cursor-pointer"
        @click="cancelPicking"
      >
        <div class="text-9xl font-bold text-white mb-8">
          {{ countdown }}
        </div>
        <div class="text-xl text-gray-300 mb-4">
          Переключитесь на нужное окно
        </div>
        <div class="text-sm text-gray-500">
          Кликните в любое место для отмены
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
