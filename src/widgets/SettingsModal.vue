<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGuiStore } from '../shared/lib/stores/gui'
import BaseIconButton from '../shared/ui/base/BaseIconButton.vue'
import BaseInput from '../shared/ui/base/BaseInput.vue'
import BaseSelect from '../shared/ui/base/BaseSelect.vue'
import BaseButton from '../shared/ui/base/BaseButton.vue'

const { t: $t, locale } = useI18n()

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const guiStore = useGuiStore()

const language = ref(guiStore.settings.value?.language || 'ru')
const enableBackups = ref(guiStore.settings.value?.enableBackups ?? true)
const backupCount = ref(guiStore.settings.value?.backupCount || 5)
const configFilePath = ref(guiStore.settings.value?.configFilePath || '')

const languageOptions = [
  { value: 'ru', label: 'Русский' },
  { value: 'en', label: 'English' }
]

watch(() => props.modelValue, (visible) => {
  if (visible) {
    document.body.style.overflow = 'hidden'
    language.value = guiStore.settings.value?.language || 'ru'
    enableBackups.value = guiStore.settings.value?.enableBackups ?? true
    backupCount.value = guiStore.settings.value?.backupCount || 5
    configFilePath.value = guiStore.settings.value?.configFilePath || ''
  } else {
    document.body.style.overflow = ''
  }
})

const close = () => {
  document.body.style.overflow = ''
  emit('update:modelValue', false)
}

const saveSettings = () => {
  guiStore.updateSettings({
    language: language.value,
    enableBackups: enableBackups.value,
    backupCount: backupCount.value
  })
  
  locale.value = language.value
  guiStore.saveToFile()
  close()
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
        <div class="bg-white rounded-lg shadow-xl w-[450px] overflow-hidden flex flex-col">
          <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 class="text-lg font-semibold text-gray-800">{{ $t('settings.title') }}</h3>
            <BaseIconButton variant="close" @click="close">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </BaseIconButton>
          </div>
          
          <div class="p-6 space-y-5">
            <BaseSelect
              v-model="language"
              :options="languageOptions"
              :label="$t('settings.language')"
            />

            <BaseInput
              v-model="configFilePath"
              :label="$t('settings.configFilePath')"
              disabled
            />

            <div class="space-y-3 pt-2">
              <div class="flex items-center gap-3">
                <input
                  id="enableBackups"
                  v-model="enableBackups"
                  type="checkbox"
                  class="w-4 h-4 rounded border-gray-300 bg-white text-blue-600 focus:ring-blue-600"
                />
                <label for="enableBackups" class="text-sm text-gray-700">
                  {{ $t('settings.enableBackups') }}
                </label>
              </div>

              <BaseInput
                v-model="backupCount"
                type="number"
                :min="1"
                :max="20"
                :label="$t('settings.backupCount')"
                :hint="$t('settings.backupCountHint')"
                :disabled="!enableBackups"
              />
            </div>
          </div>

          <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
            <BaseButton variant="secondary" @click="close">
              {{ $t('common.cancel') }}
            </BaseButton>
            <BaseButton variant="primary" @click="saveSettings">
              {{ $t('common.save') }}
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