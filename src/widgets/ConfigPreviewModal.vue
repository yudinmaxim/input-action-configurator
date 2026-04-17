<script setup lang="ts">
import { computed } from 'vue'
import { useConfigStore } from '../shared/lib/stores/config'
import { useGuiStore } from '../shared/lib/stores/gui'
import { dumpInputActionsConfig } from '../shared/lib/yaml-converter'

defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const store = useConfigStore()
const guiStore = useGuiStore()

const yamlOutput = computed(() => {
  return dumpInputActionsConfig(store.state.config)
})

const configFilePath = computed(() => guiStore.settings.value?.configFilePath || 'Not set')

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
        <div class="bg-slate-900 rounded-lg shadow-xl w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
          <div class="px-6 py-4 border-b border-slate-700 flex justify-between items-center">
            <div>
              <h3 class="text-lg font-semibold text-gray-200">Config Preview</h3>
              <p class="text-xs text-gray-400 mt-1 truncate max-w-md">{{ configFilePath }}</p>
            </div>
            <button class="close-btn" @click="close">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          
          <pre class="flex-1 overflow-auto p-4 text-sm font-mono text-green-400 whitespace-pre">{{ yamlOutput }}</pre>
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

.close-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.close-btn:hover {
  background: rgba(148, 163, 184, 0.3);
  color: #e2e8f0;
}

.close-btn:active {
  transform: scale(0.9);
}
</style>
