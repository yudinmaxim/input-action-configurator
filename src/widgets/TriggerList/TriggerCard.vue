<script setup lang="ts">
const props = defineProps<{
  trigger: any
  selected: boolean
}>()

const emit = defineEmits<{
  (e: 'select'): void
  (e: 'delete'): void
}>()
</script>

<template>
  <div
    class="mb-2 px-3 py-2 rounded-md cursor-pointer transition-colors border"
    :class="props.selected ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50 border-transparent'"
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
      <button class="delete-btn" @click.stop="emit('delete')">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2.5 3.5H11.5M5 3.5V2.5C5 2.22386 5.22386 2 5.5 2H8.5C8.77614 2 9 2.22386 9 2.5V3.5M6 6.5V10.5M8 6.5V10.5M3 3.5L3.5 11.5C3.5 11.7761 3.72386 12 4 12H10C10.2761 12 10.5 11.7761 10.5 11.5L11 3.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.delete-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.15s ease;
  flex-shrink: 0;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.delete-btn:active {
  background: rgba(239, 68, 68, 0.25);
}
</style>