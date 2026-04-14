<script setup lang='ts'>
interface IProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  fullWidth?: boolean
}

const props = withDefaults(defineProps<IProps>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  fullWidth: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const variantClass = {
  primary: 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700',
  secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200 active:bg-gray-300 border border-gray-300',
  danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
  ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 active:bg-gray-200'
}

const sizeClass = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg'
}
</script>

<template>
  <button
    class='inline-flex justify-center items-center px-4 py-2 rounded-md font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
    :class='[variantClass[variant as keyof typeof variantClass], sizeClass[size as keyof typeof sizeClass], fullWidth ? &quot;w-full&quot; : &quot;&quot;]'
    :disabled='props.disabled'
    @click='emit(&quot;click&quot;, $event)'
  >
    <slot />
  </button>
</template>