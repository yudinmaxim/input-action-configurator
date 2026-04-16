<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  title?: string
}>()

const show = ref(false)
const btnRef = ref<HTMLElement | null>(null)
const tooltipRef = ref<HTMLElement | null>(null)
const timer = ref<number | null>(null)
const tooltipPos = ref({ left: '0px', top: '0px' })

const close = () => {
  timer.value = window.setTimeout(() => show.value = false, 150)
}

const cancelClose = () => {
  if (timer.value) {
    clearTimeout(timer.value)
    timer.value = null
  }
}

const updateTooltipPos = () => {
  if (!btnRef.value) return
  const rect = btnRef.value.getBoundingClientRect()
  tooltipPos.value = {
    left: `${rect.right + 8}px`,
    top: `${rect.top}px`,
  }
}

const onMouseEnter = () => {
  updateTooltipPos()
  show.value = true
}
</script>

<template>
  <span class="help-wrapper">
    <button
      ref="btnRef"
      type="button"
      class="help-btn"
      @mouseenter="onMouseEnter"
      @mouseleave="close"
      @click.stop="show = !show"
    >
      ?
    </button>
  </span>
  <Teleport to="body">
    <div
      v-if="show"
      ref="tooltipRef"
      class="help-tooltip"
      :style="tooltipPos"
      @mouseenter="cancelClose"
      @mouseleave="close"
    >
      <div v-if="title || $slots.title" class="font-semibold text-sm mb-1">
        <slot name="title">{{ title }}</slot>
      </div>
      <div class="text-sm"><slot /></div>
    </div>
  </Teleport>
</template>

<style scoped>
.help-wrapper {
  display: inline-flex;
  align-items: flex-start;
}

.help-btn {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: none;
  background: #e5e7eb;
  color: #6b7280;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  margin-left: 4px;
}

.help-tooltip {
  position: fixed;
  z-index: 9999;
  width: 240px;
  padding: 10px 12px;
  background: #1f2937;
  color: white;
  font-size: 13px;
  line-height: 1.4;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>