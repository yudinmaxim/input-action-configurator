<script setup lang="ts">
interface IProps {
  for?: string
  required?: boolean
}

const {
  for: htmlFor = '',
  required = false
} = defineProps<IProps>()
</script>

<template>
  <label :for="htmlFor" class="text-sm font-medium text-gray-700">
    <slot />
    <span v-if="required" class="text-red-500 ml-0.5">*</span>
  </label>
</template>
