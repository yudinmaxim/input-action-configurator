<script setup lang="ts">
import { BaseCheckbox } from '../../shared/ui/base'

interface Props {
  selectedTrigger: any
}

defineProps<Props>()

const emit = defineEmits<{
  'update-field': [field: string, value: unknown]
}>()
</script>

<template>
  <BaseCard title="Options">
    <div class="grid grid-cols-2 gap-4">
      <BaseCheckbox
        :model-value="selectedTrigger.block_events || false"
        label="Block Events"
        @update:model-value="emit('update-field', 'block_events', $event)"
      />
      <BaseCheckbox
        :model-value="selectedTrigger.clear_modifiers || false"
        label="Clear Modifiers"
        @update:model-value="emit('update-field', 'clear_modifiers', $event)"
      />
      <BaseCheckbox
        :model-value="selectedTrigger.accelerated || false"
        label="Accelerated Delta"
        @update:model-value="emit('update-field', 'accelerated', $event)"
      />
      <BaseCheckbox
        :model-value="selectedTrigger.set_last_trigger || false"
        label="Set Last Trigger"
        @update:model-value="emit('update-field', 'set_last_trigger', $event)"
      />
    </div>
  </BaseCard>
</template>
