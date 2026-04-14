<script setup lang="ts">
interface IProps {
  title?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<IProps>(), {
  title: '',
  padding: 'md'
})
</script>

<template>
  <div
    class="bg-white border border-gray-200 rounded-md"
    :class="[
      props.padding === 'none' && 'p-0',
      props.padding === 'sm' && 'p-2',
      props.padding === 'md' && 'p-4',
      props.padding === 'lg' && 'p-6'
    ]"
  >
    <h3 v-if="props.title" class="text-lg font-semibold text-gray-800 mb-4">{{ props.title }}</h3>
    <slot />
  </div>
</template>