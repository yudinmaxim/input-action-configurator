<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  col1Width?: number
  col2Width?: number
  col1Min?: number
  col1Max?: number
  col2Min?: number
  col2Max?: number
}

const props = withDefaults(defineProps<Props>(), {
  col1Width: 300,
  col2Width: 400,
  col1Min: 200,
  col1Max: 500,
  col2Min: 300,
  col2Max: 600
})

const emit = defineEmits<{
  'update:col1Width': [width: number]
  'update:col2Width': [width: number]
}>()

const col1Width = ref(props.col1Width)
const col2Width = ref(props.col2Width)
const isResizing1 = ref(false)
const isResizing2 = ref(false)

let startX1 = 0
let startCol1Width = 0
let startX2 = 0
let startCol2Width = 0

// Слайдер между колонкой 1 и 2
const handleMouseDown1 = (e: MouseEvent) => {
  e.preventDefault()
  e.stopPropagation()
  
  isResizing1.value = true
  startX1 = e.clientX
  startCol1Width = col1Width.value
  
  document.addEventListener('mousemove', handleMouseMove1)
  document.addEventListener('mouseup', handleMouseUp1)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

const handleMouseMove1 = (e: MouseEvent) => {
  if (!isResizing1.value) return
  
  const delta = e.clientX - startX1
  let newCol1Width = startCol1Width + delta
  
  newCol1Width = Math.max(props.col1Min, Math.min(props.col1Max, newCol1Width))
  col1Width.value = newCol1Width
  emit('update:col1Width', newCol1Width)
}

const handleMouseUp1 = () => {
  isResizing1.value = false
  document.removeEventListener('mousemove', handleMouseMove1)
  document.removeEventListener('mouseup', handleMouseUp1)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

// Слайдер между колонкой 2 и 3
const handleMouseDown2 = (e: MouseEvent) => {
  e.preventDefault()
  e.stopPropagation()
  
  isResizing2.value = true
  startX2 = e.clientX
  startCol2Width = col2Width.value
  
  document.addEventListener('mousemove', handleMouseMove2)
  document.addEventListener('mouseup', handleMouseUp2)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

const handleMouseMove2 = (e: MouseEvent) => {
  if (!isResizing2.value) return
  
  const delta = e.clientX - startX2
  let newCol2Width = startCol2Width + delta
  
  newCol2Width = Math.max(props.col2Min, Math.min(props.col2Max, newCol2Width))
  col2Width.value = newCol2Width
  emit('update:col2Width', newCol2Width)
}

const handleMouseUp2 = () => {
  isResizing2.value = false
  document.removeEventListener('mousemove', handleMouseMove2)
  document.removeEventListener('mouseup', handleMouseUp2)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

// Очистка
const stopAllResizing = () => {
  if (isResizing1.value || isResizing2.value) {
    isResizing1.value = false
    isResizing2.value = false
    document.removeEventListener('mousemove', handleMouseMove1)
    document.removeEventListener('mousemove', handleMouseMove2)
    document.removeEventListener('mouseup', handleMouseUp1)
    document.removeEventListener('mouseup', handleMouseUp2)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }
}

// Обработка изменения размера окна
const handleWindowResize = () => {
  // Ограничиваем ширину при изменении размера окна
  col1Width.value = Math.min(col1Width.value, props.col1Max)
  col2Width.value = Math.min(col2Width.value, props.col2Max)
}

import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  window.addEventListener('resize', handleWindowResize)
})

onUnmounted(() => {
  stopAllResizing()
  window.removeEventListener('resize', handleWindowResize)
})
</script>

<template>
  <div class="flex h-full">
    <!-- Колонка 1 -->
    <div 
      class="col1 h-full overflow-hidden"
      :style="{ width: `${col1Width}px`, flexShrink: 0 }"
    >
      <slot name="col1" />
    </div>
    
    <!-- Слайдер 1 -->
    <div 
      class="resizer"
      :class="{ 'resizing': isResizing1 }"
      @mousedown="handleMouseDown1"
    >
      <div class="resizer-line" />
    </div>
    
    <!-- Колонка 2 -->
    <div 
      class="col2 h-full overflow-hidden"
      :style="{ width: `${col2Width}px`, flexShrink: 0 }"
    >
      <slot name="col2" />
    </div>
    
    <!-- Слайдер 2 -->
    <div 
      class="resizer"
      :class="{ 'resizing': isResizing2 }"
      @mousedown="handleMouseDown2"
    >
      <div class="resizer-line" />
    </div>
    
    <!-- Колонка 3 -->
    <div class="col3 flex-1 h-full overflow-hidden">
      <slot name="col3" />
    </div>
  </div>
</template>

<style scoped>
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
  z-index: 100;
  flex-shrink: 0;
}

.resizer:hover {
  background: rgba(59, 130, 246, 0.1);
}

.resizer.resizing {
  background: rgba(59, 130, 246, 0.2);
}

.resizer-line {
  width: 1px;
  height: 100%;
  background: #d1d5db;
  transition: background-color 0.2s;
}

.resizer:hover .resizer-line,
.resizer.resizing .resizer-line {
  background: #3b82f6;
}

.col1, .col2, .col3 {
  position: relative;
}
</style>
