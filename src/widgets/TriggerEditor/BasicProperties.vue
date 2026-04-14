<script setup lang="ts">
import { BaseInput, BaseSelect } from '../../shared/ui/base'

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
  <BaseCard title="Basic Properties">
    <div class="grid grid-cols-2 gap-4">
      <BaseInput
        :model-value="selectedTrigger.id || ''"
        label="ID"
        @update:model-value="emit('update-field', 'id', $event)"
      />
      <BaseSelect
        :model-value="selectedTrigger.type"
        :options="[{value: selectedTrigger.type, label: selectedTrigger.type}]"
        label="Type"
        disabled
      />
      <BaseInput
        :model-value="selectedTrigger.threshold as string || ''"
        label="Threshold"
        placeholder="optional"
        @update:model-value="emit('update-field', 'threshold', $event)"
      />
      <BaseSelect
        :model-value="selectedTrigger.speed as string || ''"
        :options="[{value:'', label:'Default'},{value:'fast', label:'Fast'},{value:'slow', label:'Slow'}]"
        label="Speed"
        @update:model-value="emit('update-field', 'speed', $event || undefined)"
      />
    </div>
  </BaseCard>
</template>
