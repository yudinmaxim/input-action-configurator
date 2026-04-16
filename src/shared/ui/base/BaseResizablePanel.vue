<script setup lang="ts">
import { ref, onMounted, onUnmounted, defineExpose } from 'vue'

interface Props {
  initialWidth: number
  minWidth?: number
  maxWidth?: number
}

const props = withDefaults(defineProps<Props>(), {
  minWidth: 200,
  maxWidth: 500
})

const emit = defineEmits<{
  'update:width': [width: number]
}>()

const leftPanel = ref<HTMLDivElement | null>(null)
const isResizing = ref(false)
let startX = 0
let startWidth = 0

const handleMouseDown = (e: MouseEvent) => {
  console.log('mousedown on resizer', e.clientX)
  e.preventDefault()
  e.stopPropagation()
  
  isResizing.value = true
  startX = e.clientX
  startWidth = props.initialWidth
  
  console.log('startX:', startX, 'startWidth:', startWidth)
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

const handleMouseMove = (e: MouseEvent) => {
  if (!isResizing.value) {
    console.log('mousemove but not resizing')
    return
  }
  
  const delta = e.clientX - startX
  let newWidth = startWidth + delta
  
  console.log('mousemove: delta', delta, 'newWidth', newWidth)
  
  // Ограничиваем ширину
  newWidth = Math.max(props.minWidth, Math.min(props.maxWidth, newWidth))
  
  emit('update:width', newWidth)
}

const handleMouseUp = () => {
  console.log('mouseup, isResizing:', isResizing.value)
  isResizing.value = false
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

// Очистка при размонтировании
onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
})

// Экспортируем состояние для отладки
defineExpose({ isResizing })
</script>

<template>
  <div class="flex h-full">
    <!-- Левая панель (изменяемая) -->
    <div 
      class="left-panel h-full overflow-hidden"
      :style="{ width: `${initialWidth}px` }"
    >
      <slot />
    </div>
    
    <!-- Слайдер (resizer) -->
    <div 
      class="resizer"
      @mousedown="handleMouseDown"
    >
      <div class="resizer-line" />
    </div>
    
    <!-- Правая панель (занимает всё оставшееся место) -->
    <div class="right-panel h-full overflow-hidden">
      <slot name="right" />
    </div>
  </div>
</template>

<style scoped>
.left-panel {
  position: relative;
}

.resizer {
  width: 8px;
  cursor: col-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  transition: background-color 0.2s;
  user-select: none;
  -webkit-user-select: none;
  position: relative;
  flex-shrink: 0;
}

.resizer:hover {
  background: rgba(59, 130, 246, 0.1);
}

.resizer:active {
  background: rgba(59, 130, 246, 0.2);
}

.resizer-line {
  width: 1px;
  height: 100%;
  background: #d1d5db;
  transition: background-color 0.2s;
}

.resizer:hover .resizer-line {
  background: #3b82f6;
}

.resizer:active .resizer-line {
  background: #2563eb;
}

.right-panel {
  position: relative;
}
</style>