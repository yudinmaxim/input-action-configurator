<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  title?: string
}>()

const show = ref(false)
const btnRef = ref<HTMLElement | null>(null)
const tooltipRef = ref<HTMLElement | null>(null)
const timer = ref<number | null>(null)
const tooltipPos = ref({ left: '0px', top: '0px' })

const TOOLTIP_WIDTH = 240
const TOOLTIP_OFFSET = 8

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
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  let left = rect.right + TOOLTIP_OFFSET
  let top = rect.top

  if (left + TOOLTIP_WIDTH > viewportWidth - 10) {
    left = rect.left - TOOLTIP_WIDTH - TOOLTIP_OFFSET
  }

  if (left < 10) {
    left = 10
  }

  if (top + 100 > viewportHeight) {
    top = Math.max(10, viewportHeight - 120)
  }

  tooltipPos.value = {
    left: `${left}px`,
    top: `${top}px`,
  }
}

const onMouseEnter = () => {
  updateTooltipPos()
  show.value = true
}
</script>

<template>
  <span class="inline-flex items-start">
    <button
      ref="btnRef"
      type="button"
      class="w-4.5 h-4.5 rounded-full bg-gray-200/50 text-gray-600 text-xs font-semibold cursor-pointer inline-flex items-center justify-center ml-1 hover:bg-gray-300/50 active:scale-90"
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
      class="fixed z-[9999] w-60 p-2.5 bg-gray-800 text-white text-sm leading-snug rounded-lg shadow-lg"
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
</style>