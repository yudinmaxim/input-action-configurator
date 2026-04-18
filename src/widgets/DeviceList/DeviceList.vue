<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useConfigStore } from '../../shared/lib/stores/config'
import { BaseTabs, BaseTab, BaseModal } from '../../shared/ui/base'
import { DeviceType } from '../../shared/lib/types'

const { t: $t } = useI18n()

defineProps<{
  selectedDevice: string | null
}>()

const emit = defineEmits<{
  'select-device': [device: string]
}>()

const store = useConfigStore()

const devices = computed(() => store.devices.value)
const deletingDevice = ref<string | null>(null)
const showDeleteModal = ref(false)

const handleTabChange = (deviceId: string) => {
  emit('select-device', deviceId)
}

const handleTabDelete = (deviceId: string) => {
  deletingDevice.value = deviceId
  showDeleteModal.value = true
}

const confirmDelete = () => {
  if (deletingDevice.value) {
    const deviceType = deletingDevice.value as DeviceType
    store.deleteDevice(deviceType)
  }
  showDeleteModal.value = false
  deletingDevice.value = null
}

const getDeviceIcon = (type: string) => {
  const icons: Record<string, string> = {
    keyboard: '⌨️',
    mouse: '🖱️',
    touchpad: '👆',
    touchscreen: '📱'
  }
  return icons[type] || '📦'
}

const getDeviceLabel = (type: string) => {
  return type === 'device-rules' ? $t('deviceLabels.deviceRules') : $t(`deviceLabels.${type}`)
}
</script>

<template>
  <div>
    <BaseTabs :model-value="selectedDevice ?? 'device-rules'" @update:model-value="handleTabChange">
      <template #default>
        <BaseTab
          id="device-rules"
          label="Device Rules"
          icon="⚙️"
        />
        <BaseTab
          v-for="device in devices"
          :key="device.type"
          :id="device.type"
          :icon="getDeviceIcon(device.type)"
          :label="getDeviceLabel(device.type)"
          deletable
          @delete="handleTabDelete(device.type)"
        >
          <template #badge>
            <span 
              class="text-xs px-2 py-0.5 rounded-full"
              :class="selectedDevice === device.type ? 'bg-blue-200 text-blue-700' : 'bg-gray-200 text-gray-600'"
            >
              {{ device.triggers.length }}
            </span>
          </template>
        </BaseTab>
      </template>
    </BaseTabs>

    <BaseModal
      v-model="showDeleteModal"
      :title="$t('device.delete')"
      :message="`Вы уверены, что хотите удалить устройство '${getDeviceLabel(deletingDevice || '')}' и все его триггеры? Это действие нельзя отменить.`"
      :confirm-text="$t('common.delete')"
      :cancel-text="$t('common.cancel')"
      confirm-variant="danger"
      @confirm="confirmDelete"
    />
  </div>
</template>