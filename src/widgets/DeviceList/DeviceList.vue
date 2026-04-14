<script setup lang="ts">
import { useConfigStore } from '../../shared/lib/stores/config'

defineProps<{
  selectedDevice: string | null
}>()

const emit = defineEmits<{
  'select-device': [device: string]
}>()

const store = useConfigStore()

const getDeviceIcon = (type: string) => {
  const icons: Record<string, string> = {
    keyboard: '⌨️',
    mouse: '🖱️',
    touchpad: '👆',
    touchscreen: '📱'
  }
  return icons[type] || '📦'
}
</script>

<template>
  <div class="w-64 border-r border-gray-200 bg-white flex flex-col">
    <div class="p-4 border-b border-gray-200">
      <h2 class="text-lg font-semibold text-gray-800">Devices</h2>
    </div>
    <div class="flex-1 overflow-y-auto p-2">
      <div
        v-for="device in store.devices.value"
        :key="device.type"
        class="mb-2"
      >
        <div
          class="flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors"
          :class="selectedDevice === device.type ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-700'"
          @click="emit('select-device', device.type)"
        >
          <span>{{ getDeviceIcon(device.type) }}</span>
          <span class="flex-1 font-medium">{{ device.type }}</span>
          <span class="text-xs text-gray-400">({{ device.triggers.length }})</span>
        </div>
      </div>
    </div>
  </div>
</template>
