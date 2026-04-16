<script setup lang="ts">
import { ref, computed } from 'vue'
import { useConfigStore } from '../../shared/lib/stores/config'
import { BaseButton } from '../../shared/ui/base'
import NewTriggerForm from './NewTriggerForm.vue'
import TriggerCard from './TriggerCard.vue'

const props = defineProps<{
  selectedDevice: string | null
  selectedTriggerId: string | null
}>()

const emit = defineEmits<{
  'select-trigger': [id: string | null]
  'add-trigger': [trigger: any]
  'delete-trigger': [id: string]
}>()

const store = useConfigStore()

const showNewTriggerForm = ref(false)

const selectedTriggerTriggers = computed(() => {
  if (!props.selectedDevice) return []
  return (store.state.config.device as any)?.[props.selectedDevice] || []
})
</script>

<template>
  <div class="w-full h-full flex flex-col border-r border-gray-200 bg-white">
    <div class="p-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
      <h2 class="text-lg font-semibold text-gray-800">Triggers</h2>
      <button 
        v-if="selectedDevice"
        class="icon-btn"
        title="Добавить триггер"
        @click="showNewTriggerForm = true"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
      </button>
    </div>
    
    <!-- New Trigger Form -->
    <NewTriggerForm
      v-if="showNewTriggerForm && selectedDevice"
      :selected-device="selectedDevice"
      @add-trigger="(trigger: any) => { emit('add-trigger', trigger); showNewTriggerForm = false }"
      @cancel="showNewTriggerForm = false"
    />
    
    <div class="flex-1 overflow-y-auto p-2">
      <div v-if="!selectedDevice" class="p-4 text-center text-gray-500">
        Select a device to see triggers
      </div>
      <div v-else>
        <TriggerCard
          v-for="trigger in selectedTriggerTriggers"
          :key="trigger.id"
          :trigger="trigger"
          :selected="selectedTriggerId === trigger.id"
          @select="emit('select-trigger', trigger.id || null)"
          @delete="emit('delete-trigger', trigger.id!)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.icon-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 6px;
  background: #f3f4f6;
  color: #374151;
  cursor: pointer;
  transition: all 0.15s ease;
}

.icon-btn:hover {
  background: #e5e7eb;
}

.icon-btn:active {
  transform: scale(0.95);
}
</style>
