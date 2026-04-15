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
  <div class="flex-1 flex flex-col overflow-hidden">
    <div class="p-4 border-b border-gray-200 bg-white">
      <h2 class="text-lg font-semibold text-gray-800">Trigger Editor</h2>
    </div>
    
    <div class="flex-1 overflow-y-auto p-4">
      <div v-if="!selectedTrigger" class="text-center text-gray-500 py-8">
        Select a trigger to edit
      </div>
      
      <div v-else :key="selectedTrigger.id" class="flex flex-col gap-6">
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
        
        <div class="flex justify-end">
          <BaseButton variant="danger" @click="emit('delete-trigger')">
            Delete Trigger
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>
