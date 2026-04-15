<script setup lang="ts">
import { provide, ref, type Ref } from 'vue'

interface IProps {
  modelValue?: string
}

const props = withDefaults(defineProps<IProps>(), {
  modelValue: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const activeTab = ref<string>(props.modelValue)

const setActiveTab = (tabId: string) => {
  activeTab.value = tabId
  emit('update:modelValue', tabId)
}

provide<Ref<string>>('activeTab', activeTab)
provide<(id: string) => void>('setActiveTab', setActiveTab)
</script>

<template>
  <div class="tabs-container">
    <div class="tab-list">
      <slot />
    </div>
    <div class="tab-content">
      <slot name="content" />
    </div>
  </div>
</template>

<style scoped>
.tabs-container {
  display: flex;
  flex-direction: column;
}

.tab-list {
  display: flex;
  gap: 0;
  border-bottom: 2px solid #e5e7eb;
  background: white;
}

.tab-content {
  flex: 1;
  overflow: auto;
}
</style>
