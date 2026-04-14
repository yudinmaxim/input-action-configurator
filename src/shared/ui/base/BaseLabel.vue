<script setup lang="ts">
interface IProps {
  for?: string
  required?: boolean
}

const props = withDefaults(defineProps<IProps>(), {
  for: '',
  required: false
})
</script>

<template>
  <label :for="props.for" class="text-sm font-medium text-gray-700">
    <slot />
    <span v-if="props.required" class="text-red-500 ml-0.5">*</span>
  </label>
</template>