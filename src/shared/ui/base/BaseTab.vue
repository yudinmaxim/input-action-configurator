<script setup lang="ts">
import { inject, type Ref } from 'vue'

interface IProps {
  id: string
  label: string
  icon?: string
  deletable?: boolean
}

const props = withDefaults(defineProps<IProps>(), {
  deletable: false
})

const activeTab = inject<Ref<string>>('activeTab')
const setActiveTab = inject<(id: string) => void>('setActiveTab')

if (!activeTab || !setActiveTab) {
  throw new Error('BaseTab must be used within BaseTabs')
}

const emit = defineEmits<{
  'delete': []
}>()

const isActive = () => activeTab.value === props.id

const handleClick = () => {
  setActiveTab(props.id)
}

const handleDelete = (event: Event) => {
  event.stopPropagation()
  emit('delete')
}
</script>

<template>
  <div class="tab-item-wrapper">
    <button
      class="tab-item flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap"
      :class="isActive() 
        ? 'border-blue-500 text-blue-600 bg-blue-50' 
        : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'"
      @click="handleClick"
    >
      <span v-if="icon" class="text-lg">{{ icon }}</span>
      <span class="font-medium">{{ label }}</span>
      <slot name="badge" />
      <button
        v-if="deletable"
        class="delete-btn"
        @click="handleDelete"
        title="Delete tab"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2.5 3.5H11.5M5 3.5V2.5C5 2.22386 5.22386 2 5.5 2H8.5C8.77614 2 9 2.22386 9 2.5V3.5M6 6.5V10.5M8 6.5V10.5M3 3.5L3.5 11.5C3.5 11.7761 3.72386 12 4 12H10C10.2761 12 10.5 11.7761 10.5 11.5L11 3.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </button>
  </div>
</template>

<style scoped>
.tab-item-wrapper {
  display: inline-block;
}

.tab-item {
  outline: none;
  border-right: none;
  position: relative;
}

.tab-item:first-child {
  border-left-radius: 8px;
}

.tab-item:focus-visible {
  ring: 2px;
  ring-offset: 2px;
  ring-color: blue;
}

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
  transition: all 0.15s ease;
  padding: 0;
  margin-left: 4px;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.delete-btn:active {
  transform: scale(0.9);
}
</style>