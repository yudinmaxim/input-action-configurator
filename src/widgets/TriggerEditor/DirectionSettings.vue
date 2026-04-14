<script setup lang="ts">
import { SwipeDirectionOptions, CircleDirectionOptions, MouseButtonOptions } from '../../shared/lib/stores/config'
import { BaseSelect, BaseCheckbox } from '../../shared/ui/base'

interface Props {
  selectedTrigger: any
  selectedDevice: string | null
}

defineProps<Props>()

const emit = defineEmits<{
  'update-field': [field: string, value: unknown]
}>()
</script>

<template>
  <BaseCard title="Direction & Movement">
    <div class="grid grid-cols-2 gap-4">
      <BaseSelect
        v-if="selectedTrigger.type === 'swipe'"
        :model-value="selectedTrigger.direction"
        :options="SwipeDirectionOptions"
        label="Direction"
        @update:model-value="emit('update-field', 'direction', $event)"
      />
      <BaseSelect
        v-if="selectedTrigger.type === 'circle'"
        :model-value="selectedTrigger.direction"
        :options="CircleDirectionOptions"
        label="Direction"
        @update:model-value="emit('update-field', 'direction', $event)"
      />
      <BaseSelect
        v-if="['touchpad', 'touchscreen'].includes(selectedDevice as string)"
        :model-value="selectedTrigger.fingers || 1"
        :options="[{value:1, label:'1 finger'},{value:2, label:'2 fingers'},{value:3, label:'3 fingers'},{value:4, label:'4 fingers'}]"
        label="Fingers"
        @update:model-value="emit('update-field', 'fingers', Number($event))"
      />
      <BaseSelect
        v-if="selectedDevice === 'mouse'"
        :model-value="selectedTrigger.mouse_buttons?.[0] || ''"
        :options="MouseButtonOptions"
        label="Mouse Button"
        placeholder="Any"
        @update:model-value="emit('update-field', 'mouse_buttons', $event ? [$event] : undefined)"
      />
      <BaseCheckbox
        :model-value="selectedTrigger.lock_pointer || false"
        label="Lock Pointer"
        @update:model-value="emit('update-field', 'lock_pointer', $event)"
      />
      <BaseCheckbox
        :model-value="selectedTrigger.bidirectional || false"
        label="Bidirectional"
        @update:model-value="emit('update-field', 'bidirectional', $event)"
      />
    </div>
  </BaseCard>
</template>
