<script setup lang="ts">
import { BaseButton } from '../../shared/ui/base'
import { BasicProperties, DirectionSettings, ActionsEditor, Options, ConditionsEditor } from '../TriggerEditor'

interface Props {
  selectedDevice: string | null
  selectedTriggerId: string | null
  selectedTrigger: any
  actions: any[]
}

defineProps<Props>()

const emit = defineEmits<{
  'update-field': [field: string, value: unknown]
  'update-action': [index: number, updates: any]
  'delete-action': [index: number]
  'add-action': [action: any]
  'delete-trigger': []
}>()
</script>

<template>
  <div class="flex-1 flex flex-col overflow-hidden h-full">
    <div class="px-4 border-b border-gray-200 bg-white flex justify-between items-center w-full">
      <h2 class="text-lg font-semibold text-gray-800">Trigger Editor</h2>
    </div>
    
    <div class="flex-1 min-h-0 overflow-y-auto p-4 pb-8">
      <div v-if="!selectedTrigger" class="text-center text-gray-500 py-8">
        Select a trigger to edit
      </div>
      
      <div v-else :key="selectedTrigger.id" class="flex flex-col gap-6 mb-24">
        <BasicProperties
          :selected-trigger="selectedTrigger"
          :selected-device="selectedDevice"
          @update-field="(field, value) => emit('update-field', field, value)"
        />
        
        <DirectionSettings
          :selected-trigger="selectedTrigger"
          :selected-device="selectedDevice"
          @update-field="(field, value) => emit('update-field', field, value)"
        />
        
        <ConditionsEditor
          :selected-trigger="selectedTrigger"
          @update-field="(field, value) => emit('update-field', field, value)"
        />
        
        <ActionsEditor
          :selected-device="selectedDevice"
          :selected-trigger-id="selectedTriggerId"
          :actions="actions"
          @update-action="(index, updates) => emit('update-action', index, updates)"
          @delete-action="(index) => emit('delete-action', index)"
          @add-action="(action) => emit('add-action', action)"
        />
        
        <Options
          :selected-trigger="selectedTrigger"
          @update-field="(field, value) => emit('update-field', field, value)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.delete-btn {
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

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.delete-btn:active {
  transform: scale(0.9);
}
</style>
