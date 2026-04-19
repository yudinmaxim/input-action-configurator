<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGuiStore } from '../shared/lib/stores/gui'
import { configLinks } from '../shared/lib/configLinks'
import BaseIconButton from '../shared/ui/base/BaseIconButton.vue'
import BaseButton from '../shared/ui/base/BaseButton.vue'

const { t: $t } = useI18n()

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const guiStore = useGuiStore()

const dontShowAgain = ref(false)

watch(() => props.modelValue, (visible) => {
  if (visible) {
    dontShowAgain.value = guiStore.settings.value?.hasSeenWelcome ?? false
  }
})

const close = () => {
  if (dontShowAgain.value) {
    guiStore.updateSettings({ hasSeenWelcome: true })
    guiStore.saveToFile()
  }
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
        <div class="bg-white rounded-lg shadow-xl w-[500px] max-h-[80vh] overflow-hidden flex flex-col">
          <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 class="text-lg font-semibold text-gray-800">{{ $t('welcome.title') }}</h3>
            <BaseIconButton variant="close" @click="close">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </BaseIconButton>
          </div>
          
          <div class="p-6 space-y-5 overflow-auto">
            <p class="text-gray-600">{{ $t('welcome.description') }}</p>
            
            <div class="bg-blue-50 rounded-lg p-4">
              <h4 class="font-semibold text-blue-800 mb-2">{{ $t('welcome.inputActionsTitle') }}</h4>
              <p class="text-sm text-blue-700 mb-3">{{ $t('welcome.inputActionsDesc') }}</p>
<a 
                :href="configLinks.inputActions"
                target="_blank"
                class="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                {{ $t('welcome.inputActionsInstall') }} →
              </a>
            </div>

            <div class="bg-amber-50 rounded-lg p-4">
              <h4 class="font-semibold text-amber-800 mb-2">{{ $t('welcome.focusNotifierTitle') }}</h4>
              <p class="text-sm text-amber-700 mb-3">{{ $t('welcome.focusNotifierDesc') }}</p>
              <a 
                :href="configLinks.focusNotifier"
                target="_blank"
                class="text-sm text-amber-600 hover:text-amber-800 underline"
              >
                {{ $t('welcome.focusNotifierInstall') }} →
              </a>
            </div>
          </div>

          <div class="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
            <label class="flex items-center gap-3 cursor-pointer">
              <input
                v-model="dontShowAgain"
                type="checkbox"
                class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
              />
              <span class="text-sm text-gray-600">{{ $t('welcome.dontShowAgain') }}</span>
            </label>
            <BaseButton variant="primary" @click="close">
              {{ $t('welcome.gotIt') }}
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