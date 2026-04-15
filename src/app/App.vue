<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useConfigStore } from '../shared/lib/stores/config'
import { DeviceList } from '../widgets/DeviceList'
import { TriggerList } from '../widgets/TriggerList'
import { TriggerEditor } from '../widgets/TriggerEditor'
import YamlPreview from '../widgets/YamlPreview/YamlPreview.vue'
import { DeviceType } from '../shared/lib/stores/config'
import BaseButton from '../shared/ui/base/BaseButton.vue'
import BaseDropdown from '../shared/ui/base/BaseDropdown.vue'
import BaseDropdownItem from '../shared/ui/base/BaseDropdownItem.vue'
import BaseThreeColumnPanel from '../shared/ui/base/BaseThreeColumnPanel.vue'
import { getCurrentWindow } from '@tauri-apps/api/window'

const store = useConfigStore()
const appWindow = getCurrentWindow()

onMounted(async () => {
  try {
    const result = await store.loadFromFile()
    if (!result.success) {
      console.warn('Failed to load config:', result.error)
    }
  } catch (e) {
    console.warn('Cannot load config (Tauri not running):', e)
  }
})

const selectedDevice = computed(() => store.state.selectedDevice)
const selectedTriggerId = computed(() => store.state.selectedTriggerId)
const selectedTrigger = store.selectedTrigger
const currentActions = computed(() => selectedTrigger.value?.actions || [])
const isDirty = computed(() => store.state.isDirty)

// Width for left column
const triggerListWidth = ref(300)

// Add device dropdown state
const selectedDeviceType = ref<DeviceType | ''>('')

const deviceTypeOptions = [
  { value: DeviceType.KEYBOARD, label: 'Keyboard', icon: '⌨️' },
  { value: DeviceType.MOUSE, label: 'Mouse', icon: '🖱️' },
  { value: DeviceType.TOUCHPAD, label: 'Touchpad', icon: '👆' },
  { value: DeviceType.TOUCHSCREEN, label: 'Touchscreen', icon: '📱' }
]

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

const handleSave = async () => {
  try {
    const result = await store.saveToFile()
    if (!result.success) {
      console.warn('Failed to save:', result.error)
    }
  } catch (e) {
    console.warn('Cannot save config:', e)
  }
}

const handleMinimize = async () => {
  try {
    await appWindow.minimize()
  } catch (e) {
    console.error('Failed to minimize:', e)
  }
}

const handleMaximize = async () => {
  try {
    const isMax = await appWindow.isMaximized()
    if (isMax) {
      await appWindow.unmaximize()
    } else {
      await appWindow.maximize()
    }
  } catch (e) {
    console.error('Failed to maximize:', e)
  }
}

const handleClose = async () => {
  try {
    await appWindow.close()
  } catch (e) {
    console.error('Failed to close:', e)
  }
}

const handleTitleBarMouseDown = async (event: MouseEvent) => {
  // Не перетаскиваем, если клик по кнопкам или их детям
  const target = event.target as HTMLElement
  if (target.closest('button, [role="button"], .control-btn')) {
    return
  }
  
  try {
    await appWindow.startDragging()
  } catch (e) {
    console.error('Failed to start drag:', e)
  }
}

const confirmAddDevice = (deviceType: string | number) => {
  console.log('Adding device:', deviceType)
  if (!deviceType) return
  
  const type = deviceType as DeviceType
  
  // Check if device already exists (has triggers)
  const existingDevice = store.devices.value.find(d => d.type === type)
  if (existingDevice) {
    console.warn(`Device ${type} already exists`)
    return
  }
  
  // Initialize empty device in config
  if (!store.state.config.device) {
    store.state.config.device = {} as any
  }
  store.state.config.device[type] = []
  store.state.isDirty = true
  console.log('Device config after add:', store.state.config.device)
  
  // Select the new device
  store.setSelectedDevice(type)
  console.log('Selected device:', store.state.selectedDevice)
}
</script>

<template>
  <div class="flex flex-col h-screen bg-gray-50">
    <!-- Custom Title Bar -->
    <header 
      class="titlebar flex items-center justify-between px-4 bg-white border-b border-gray-200 select-none"
      @mousedown="handleTitleBarMouseDown"
    >
      <!-- Draggable area (clicks in the middle, not near edges) -->
      <div class="flex-1 flex items-center gap-3 min-w-0 h-10">
        <h1 class="text-base font-semibold text-gray-800 truncate">Input Action Configurator</h1>
        <span v-if="isDirty" class="text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded shrink-0">Unsaved changes</span>
      </div>
      
      <!-- Right side - Window controls (no drag) -->
      <div class="flex items-center gap-2 shrink-0 ml-4">
        <BaseDropdown @select="confirmAddDevice">
          <template #trigger>
            <BaseButton variant="secondary" size="sm">
              + Add Device
            </BaseButton>
          </template>
          <template #default>
            <BaseDropdownItem 
              v-for="option in deviceTypeOptions"
              :key="option.value"
              :value="option.value"
              class="flex items-center gap-2"
            >
              <span class="text-lg">{{ option.icon }}</span>
              <span>{{ option.label }}</span>
            </BaseDropdownItem>
          </template>
        </BaseDropdown>
        
        <BaseButton variant="primary" size="sm" @click="handleSave">
          Save
        </BaseButton>
        <div class="flex border-l border-gray-300 pl-2 ml-2 window-controls">
          <button 
            class="control-btn minimize"
            @click="handleMinimize"
            title="Minimize"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
            </svg>
          </button>
          <button 
            class="control-btn maximize"
            @click="handleMaximize"
            title="Maximize"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
            </svg>
          </button>
          <button 
            class="control-btn close"
            @click="handleClose"
            title="Close"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
    </header>
    
    <!-- Device Tabs -->
    <DeviceList
      :selected-device="selectedDevice"
      @select-device="handleSelectDevice"
    />
    
    <!-- Three column layout with resizable panels -->
    <BaseThreeColumnPanel
      :col1-width="triggerListWidth"
      :col1-min="200"
      :col1-max="500"
      @update:col1-width="triggerListWidth = $event"
    >
      <template #col1>
        <TriggerList
          :selected-device="selectedDevice"
          :selected-trigger-id="selectedTriggerId"
          @select-trigger="handleSelectTrigger"
          @add-trigger="handleAddTrigger"
          @delete-trigger="handleDeleteTrigger"
        />
      </template>
      
      <template #col2>
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
      </template>
      
      <template #col3>
        <YamlPreview />
      </template>
    </BaseThreeColumnPanel>
  </div>
</template>

<style>
body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.titlebar {
  height: 40px;
  cursor: default;
}

.drag-content {
  flex: 1;
}

.window-controls {
  -webkit-app-region: no-drag;
  app-region: no-drag;
}

.control-btn {
  width: 46px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: background-color 0.15s;
}

.control-btn:hover {
  background-color: #f3f4f6;
}

.control-btn.close:hover {
  background-color: #ef4444;
}

.control-btn.close:hover svg {
  color: white;
}
</style>
