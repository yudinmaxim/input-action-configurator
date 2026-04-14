<script setup lang="ts">
import { computed } from 'vue'
import { useConfigStore } from '../shared/lib/stores/config'
import { DeviceList } from '../widgets/DeviceList'
import { TriggerList } from '../widgets/TriggerList'
import { TriggerEditor } from '../widgets/TriggerEditor'
import YamlPreview from '../widgets/YamlPreview/YamlPreview.vue'
import { DeviceType } from '../shared/lib/stores/config'

const store = useConfigStore()

const selectedDevice = computed(() => store.state.selectedDevice)
const selectedTriggerId = computed(() => store.state.selectedTriggerId)
const selectedTrigger = store.selectedTrigger
const currentActions = computed(() => selectedTrigger.value?.actions || [])

const handleSelectDevice = (device: string) => {
  store.setSelectedDevice(device as DeviceType)
}

const handleSelectTrigger = (id: string | null) => {
  store.setSelectedTrigger(id)
}

const handleAddTrigger = (trigger: any) => {
  if (!store.state.selectedDevice) return
  store.addTrigger(store.state.selectedDevice, trigger)
}

const handleDeleteTrigger = (id: string) => {
  if (!store.state.selectedDevice) return
  store.deleteTrigger(store.state.selectedDevice, id)
}

const handleUpdateTriggerField = (field: string, value: unknown) => {
  if (!store.state.selectedDevice || !store.state.selectedTriggerId) return
  store.updateTrigger(store.state.selectedDevice, store.state.selectedTriggerId, { [field]: value })
}

const handleUpdateAction = (index: number, updates: any) => {
  if (!store.state.selectedDevice || !store.state.selectedTriggerId) return
  store.updateAction(store.state.selectedDevice, store.state.selectedTriggerId, index, updates)
}

const handleDeleteAction = (index: number) => {
  if (!store.state.selectedDevice || !store.state.selectedTriggerId) return
  store.deleteAction(store.state.selectedDevice, store.state.selectedTriggerId, index)
}

const handleAddAction = (action: any) => {
  if (!store.state.selectedDevice || !store.state.selectedTriggerId) return
  store.addAction(store.state.selectedDevice, store.state.selectedTriggerId, action)
}

const handleDeleteCurrentTrigger = () => {
  if (!store.state.selectedDevice || !store.state.selectedTriggerId) return
  store.deleteTrigger(store.state.selectedDevice, store.state.selectedTriggerId)
}
</script>

<template>
  <div class="flex h-screen bg-gray-50">
    <DeviceList
      :selected-device="selectedDevice"
      @select-device="handleSelectDevice"
    />
    
    <TriggerList
      :selected-device="selectedDevice"
      :selected-trigger-id="selectedTriggerId"
      @select-trigger="handleSelectTrigger"
      @add-trigger="handleAddTrigger"
      @delete-trigger="handleDeleteTrigger"
    />
    
    <TriggerEditor
      :selected-device="selectedDevice"
      :selected-trigger-id="selectedTriggerId"
      :selected-trigger="selectedTrigger"
      :actions="currentActions"
      @update-field="handleUpdateTriggerField"
      @update-action="handleUpdateAction"
      @delete-action="handleDeleteAction"
      @add-action="handleAddAction"
      @delete-trigger="handleDeleteCurrentTrigger"
    />
    
    <YamlPreview />
  </div>
</template>

<style>
body {
  margin: 0;
  padding: 0;
}
</style>
