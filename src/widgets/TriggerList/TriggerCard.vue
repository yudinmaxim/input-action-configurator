<script setup lang="ts">
import { ref } from 'vue'
import ConfirmModal from '../ConfirmModal.vue'
import BaseIconButton from '../../shared/ui/base/BaseIconButton.vue'

const props = defineProps<{
  trigger: any
  selected: boolean
}>()

const emit = defineEmits<{
  (e: 'select'): void
  (e: 'delete'): void
  (e: 'duplicate'): void
}>()

const showConfirm = ref(false)
</script>

<template>
  <ConfirmModal
    v-if="showConfirm"
    :message="`Удалить триггер '${props.trigger.id}'?`"
    @confirm="emit('delete'); showConfirm = false"
    @cancel="showConfirm = false"
  />
  <div
    class="mb-2 px-3 py-2 rounded-md cursor-pointer transition-colors border"
    :class="props.selected ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50 border-transparent'"
    :title="props.trigger.id"
    @click="emit('select')"
  >
    <div class="flex justify-between items-start">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <span class="font-medium text-gray-800 truncate font-mono">{{ props.trigger.id }}</span>
          <span v-if="props.trigger.fingers" class="text-xs text-gray-500">{{ props.trigger.fingers }}f</span>
        </div>
        <div class="text-xs text-gray-400 mt-0.5 truncate">
          {{ props.trigger.type }}
        </div>
      </div>
      <BaseIconButton variant="icon" @click.stop="emit('duplicate')" title="Дублировать">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
        </svg>
      </BaseIconButton>
      <BaseIconButton variant="delete" @click.stop="showConfirm = true" title="Удалить">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2.5 3.5H11.5M5 3.5V2.5C5 2.22386 5.22386 2 5.5 2H8.5C8.77614 2 9 2.22386 9 2.5V3.5M6 6.5V10.5M8 6.5V10.5M3 3.5L3.5 11.5C3.5 11.7761 3.72386 12 4 12H10C10.2761 12 10.5 11.7761 10.5 11.5L11 3.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </BaseIconButton>
    </div>
  </div>
</template>

<style scoped>
</style>