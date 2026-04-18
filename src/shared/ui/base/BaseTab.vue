<script setup lang="ts">
import { inject, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseIconButton from './BaseIconButton.vue'

const { t: $t } = useI18n()

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
  <div class="inline-block">
    <button
      class="flex items-center gap-2 px-4 py-2 transition-colors whitespace-nowrap outline-none border rounded-lg relative bg-white"
      :class="isActive() 
        ? 'bg-blue-100 text-blue-700 font-medium ring-2 ring-blue-500 ring-offset-1' 
        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'"
      @click="handleClick"
    >
      <span v-if="icon" class="text-lg">{{ icon }}</span>
      <span class="font-medium">{{ label }}</span>
      <slot name="badge" />
      <BaseIconButton 
        v-if="deletable"
        variant="delete"
        class="ml-1"
        @click="handleDelete"
        :title="$t('labels.deleteTab')"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2.5 3.5H11.5M5 3.5V2.5C5 2.22386 5.22386 2 5.5 2H8.5C8.77614 2 9 2.22386 9 2.5V3.5M6 6.5V10.5M8 6.5V10.5M3 3.5L3.5 11.5C3.5 11.7761 3.72386 12 4 12H10C10.2761 12 10.5 11.7761 10.5 11.5L11 3.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </BaseIconButton>
    </button>
  </div>
</template>

<style scoped>
</style>