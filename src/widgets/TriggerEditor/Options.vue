<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { BaseCheckbox, BaseCard } from '../../shared/ui/base'

const { t: $t } = useI18n()

interface Props {
  selectedTrigger: any
}

defineProps<Props>()

const emit = defineEmits<{
  'update-field': [field: string, value: unknown]
}>()
</script>

<template>
  <BaseCard :title="$t('labels.options')">
    <div class="grid grid-cols-2 gap-4">
      <BaseCheckbox
        :model-value="selectedTrigger.block_events || false"
:label="$t('labels.blockEvents')"
        />
        <BaseCheckbox
          :model-value="selectedTrigger.options?.clear_modifiers"
          :label="$t('labels.clearModifiers')"
        @update:model-value="emit('update-field', 'clear_modifiers', $event)"
      />
      <BaseCheckbox
        :model-value="selectedTrigger.accelerated || false"
:label="$t('labels.acceleratedDelta')"
        />
        <BaseCheckbox
          :model-value="selectedTrigger.options?.set_last_trigger"
          :label="$t('labels.setLastTrigger')"
        @update:model-value="emit('update-field', 'set_last_trigger', $event)"
      />
    </div>
  </BaseCard>
</template>
