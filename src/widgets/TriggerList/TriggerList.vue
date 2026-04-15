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
      <BaseButton
        v-if="selectedDevice"
        size="sm"
        @click="showNewTriggerForm = true"
      >
        + Add
      </BaseButton>
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
