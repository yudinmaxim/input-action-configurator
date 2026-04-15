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
        class="delete-btn inline-flex items-center justify-center w-5 h-5 ml-2 text-gray-400 hover:text-red-500 hover:bg-red-100 rounded transition-colors"
        @click="handleDelete"
        title="Delete tab"
      >
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
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
  border: none;
  cursor: pointer;
  padding: 0;
}
</style>