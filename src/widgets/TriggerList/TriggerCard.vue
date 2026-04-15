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
      <button
        class="text-red-400 hover:text-red-600 text-sm flex-shrink-0 ml-2"
        @click.stop="emit('delete')"
      >
        ✕
      </button>
    </div>
  </div>
</template>