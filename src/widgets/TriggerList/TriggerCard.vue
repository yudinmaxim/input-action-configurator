<script setup lang="ts">
defineProps<{
  trigger: any
  selected: boolean
}>()

const emit = defineEmits<{
  'select': []
  'delete': []
}>()
</script>

<template>
  <div
    class="mb-2 px-3 py-2 rounded-md cursor-pointer transition-colors border"
    :class="selected ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50 border-transparent'"
    @click="emit('select')"
  >
    <div class="flex justify-between items-start">
      <div>
        <span class="font-medium text-gray-800">{{ trigger.type }}</span>
        <span v-if="trigger.fingers" class="text-gray-500 ml-1">{{ trigger.fingers }}f</span>
      </div>
      <button
        class="text-red-400 hover:text-red-600 text-sm"
        @click.stop="emit('delete')"
      >
        ✕
      </button>
    </div>
    <div class="text-xs text-gray-500 mt-1">
      {{ trigger.direction || trigger.mouse_buttons?.join(', ') || trigger.keys?.join('+') || '—' }}
    </div>
  </div>
</template>
