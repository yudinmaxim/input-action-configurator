<script setup lang="ts">
import { computed } from 'vue'
import { BaseButton } from '../shared/ui/base'
import { useConfigStore } from '../shared/lib/stores/config'
import { dumpInputActionsConfig } from '../shared/lib/yaml-converter'

defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const store = useConfigStore()

const yamlOutput = computed(() => {
  return dumpInputActionsConfig(store.state.config)
})

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
            <h3 class="text-lg font-semibold text-gray-200">Config Preview</h3>
          </div>
          
          <pre class="flex-1 overflow-auto p-4 text-sm font-mono text-green-400 whitespace-pre">{{ yamlOutput }}</pre>
          
          <div class="px-6 py-4 bg-slate-800 flex justify-end">
            <BaseButton variant="ghost" @click="close">
              Закрыть
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
