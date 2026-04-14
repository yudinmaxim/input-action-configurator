<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  title?: string
}

defineProps<Props>()

const show = ref(false)
const timer = ref<number | null>(null)

const close = () => {
  timer.value = window.setTimeout(() => show.value = false, 150)
}

const cancelClose = () => {
  if (timer.value) {
    clearTimeout(timer.value)
    timer.value = null
  }
}
</script>

<template>
  <div class="relative inline-block self-start">
    <button
      type="button"
      class="text-gray-400 hover:text-gray-600 text-sm px-1"
      @click="show = !show"
      @mouseenter="cancelClose"
      @mouseleave="close"
    >
      ?
    </button>
    <div
      v-if="show"
      class="absolute z-[100] left-full top-0 ml-2 w-64 p-3 bg-gray-800 text-white text-sm rounded-md shadow-lg whitespace-pre-line"
      @mouseenter="cancelClose"
      @mouseleave="close"
    >
      <div v-if="title" class="font-medium mb-1">{{ title }}</div>
      <div class="leading-relaxed"><slot /></div>
    </div>
  </div>
</template>