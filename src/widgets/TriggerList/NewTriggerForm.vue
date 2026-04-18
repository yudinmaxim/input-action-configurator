<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { BaseButton, BaseInput, BaseSelect } from '../../shared/ui/base'

const { t: $t } = useI18n()

const props = defineProps<{
  selectedDevice: string | null
}>()

const emit = defineEmits<{
  'add-trigger': [trigger: any]
  'cancel': []
}>()

const newTriggerType = ref('')
const newTriggerId = ref('')

const availableTriggerTypes = computed(() => {
  if (!props.selectedDevice) return []
  
  const typeMap: Record<string, string> = {
    swipe: 'Swipe',
    circle: 'Circle',
    hold: 'Hold',
    tap: 'Tap',
    click: 'Click',
    stroke: 'Stroke',
    pinch: 'Pinch',
    rotate: 'Rotate',
    wheel: 'Wheel',
    press: 'Press',
    shortcut: 'Shortcut'
  }
  
  return Object.keys(typeMap).map(k => ({ value: k, label: typeMap[k] }))
})

const createNewTrigger = () => {
  if (!props.selectedDevice || !newTriggerType.value || !newTriggerId.value) return
  
  const trigger = {
    type: newTriggerType.value,
    id: newTriggerId.value,
    actions: []
  }
  
  emit('add-trigger', trigger)
  newTriggerType.value = ''
  newTriggerId.value = ''
}
</script>

<template>
  <div class="p-4 border-b border-gray-200 bg-gray-50">
    <div class="flex flex-col gap-2">
      <BaseSelect
        v-model="newTriggerType"
        :options="availableTriggerTypes"
        placeholder="Select trigger type"
        :label="$t('labels.type')"
      />
      <BaseInput
        v-model="newTriggerId"
        :label="$t('labels.id')"
        placeholder="unique-trigger-id"
      />
      <div class="flex gap-2">
        <BaseButton size="sm" @click="createNewTrigger">{{ $t('labels.create') }}</BaseButton>
        <BaseButton size="sm" variant="ghost" @click="emit('cancel')">{{ $t('labels.cancel') }}</BaseButton>
      </div>
    </div>
  </div>
</template>
