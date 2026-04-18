<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { BasicProperties, DirectionSettings, ActionsEditor, Options, ConditionsEditor } from '../TriggerEditor'

const { t: $t } = useI18n()

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
      <h2 class="text-lg font-semibold text-gray-800">{{ $t('labels.triggerEditor') }}</h2>
    </div>
    
    <div class="flex-1 min-h-0 overflow-y-auto p-4 pb-8">
      <div v-if="!selectedTrigger" class="text-center text-gray-500 py-8">
        {{ $t('labels.selectTrigger') }}
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
</style>
