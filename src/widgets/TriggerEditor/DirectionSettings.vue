<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { SwipeDirectionOptions, CircleDirectionOptions, MouseButtonOptions } from '../../shared/lib/stores/config'
import { BaseSelect, BaseCheckbox, BaseCard } from '../../shared/ui/base'

const { t: $t } = useI18n()

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
  <BaseCard :title="$t('labels.directionMovement')">
    <div class="grid grid-cols-2 gap-4">
      <BaseSelect
        v-if="selectedTrigger.type === 'swipe'"
        :model-value="selectedTrigger.direction"
        :options="SwipeDirectionOptions"
        :label="$t('labels.direction')"
        expanded
        @update:model-value="emit('update-field', 'direction', $event)"
      />
      <BaseSelect
        v-if="selectedTrigger.type === 'circle'"
        :model-value="selectedTrigger.direction"
        :options="CircleDirectionOptions"
        :label="$t('labels.direction')"
        expanded
        @update:model-value="emit('update-field', 'direction', $event)"
      />
      <BaseSelect
        v-if="['touchpad', 'touchscreen'].includes(selectedDevice as string)"
        :model-value="selectedTrigger.fingers || 1"
        :options="[{value:1, label:$t('labels.finger1')},{value:2, label:$t('labels.finger2')},{value:3, label:$t('labels.finger3')},{value:4, label:$t('labels.finger4')}]"
        :label="$t('labels.fingers')"
        expanded
        @update:model-value="emit('update-field', 'fingers', Number($event))"
      />
      <BaseSelect
        v-if="selectedDevice === 'mouse'"
        :model-value="selectedTrigger.mouse_buttons?.[0] || ''"
        :options="MouseButtonOptions"
        :label="$t('labels.mouseButton')"
        :placeholder="$t('labels.any')"
        expanded
        @update:model-value="emit('update-field', 'mouse_buttons', $event ? [$event] : undefined)"
      />
      <BaseCheckbox
        :model-value="selectedTrigger.lock_pointer || false"
        :label="$t('labels.lockPointer')"
        @update:model-value="emit('update-field', 'lock_pointer', $event)"
      />
      <BaseCheckbox
        :model-value="selectedTrigger.bidirectional || false"
        :label="$t('labels.bidirectional')"
        @update:model-value="emit('update-field', 'bidirectional', $event)"
      />
    </div>
  </BaseCard>
</template>
