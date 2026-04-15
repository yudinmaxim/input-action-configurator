<script setup lang="ts">
import { computed } from 'vue'
import { useConfigStore } from '../../shared/lib/stores/config'
import { dumpInputActionsConfig } from '../../shared/lib/yaml-converter'

const store = useConfigStore()

const config = computed(() => store.state.config)

const yamlOutput = computed(() => {
  return dumpInputActionsConfig(config.value)
})
</script>

<template>
  <div class="w-80 border-l border-gray-200 bg-slate-900 flex flex-col h-full">
    <div class="p-4 border-b border-gray-700">
      <h2 class="text-lg font-semibold text-gray-200">YAML Preview</h2>
    </div>
    <pre class="flex-1 overflow-auto p-4 text-sm font-mono text-green-400 whitespace-pre">{{ yamlOutput }}</pre>
  </div>
</template>