<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGuiStore } from '../shared/lib/stores/gui'
import { open } from '@tauri-apps/plugin-dialog'
import { writeText } from '@tauri-apps/plugin-clipboard-manager'
import { open as openPath } from '@tauri-apps/plugin-fs'
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

const browseConfigFile = async () => {
  try {
    const selected = await open({
      multiple: false,
      filters: [{
        name: 'YAML',
        extensions: ['yaml', 'yml']
      }]
    })
    if (selected && typeof selected === 'string') {
      configFilePath.value = selected
    }
  } catch (e) {
    console.warn('File dialog cancelled or error:', e)
  }
}

const copyPath = async () => {
  if (!configFilePath.value) return
  try {
    await writeText(configFilePath.value)
  } catch (e) {
    console.warn('Failed to copy path:', e)
  }
}

const openLocation = async () => {
  if (!configFilePath.value) return
  try {
    const parent = configFilePath.value.split('/').slice(0, -1).join('/')
    if (parent) {
      await openPath(parent)
    }
  } catch (e) {
    console.warn('Failed to open location:', e)
  }
}

const saveSettings = () => {
  guiStore.updateSettings({
    language: language.value,
    enableBackups: enableBackups.value,
    backupCount: backupCount.value,
    configFilePath: configFilePath.value || null
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
              expanded
              iconsOverlay
            >
              <template #append>
                <div class="flex items-center -mr-2">
                  <BaseIconButton variant="icon" :title="$t('form.browse')" @click="browseConfigFile">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
                    </svg>
                  </BaseIconButton>
                  <BaseIconButton variant="icon" :title="$t('settings.copyPath')" :disabled="!configFilePath" @click="copyPath">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                    </svg>
                  </BaseIconButton>
                  <BaseIconButton variant="icon" :title="$t('settings.openLocation')" :disabled="!configFilePath" @click="openLocation">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 9"/>
                    </svg>
                  </BaseIconButton>
                </div>
              </template>
            </BaseInput>

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