<script setup lang="ts">
import BaseModal from '../shared/ui/base/BaseModal.vue'

interface IProps {
  title?: string
  message: string
}

defineProps<IProps>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <BaseModal
    :model-value="true"
    :title="title || 'Подтверждение'"
    :message="message"
    confirm-text="Удалить"
    cancel-text="Отмена"
    confirm-variant="danger"
    @update:model-value="$emit('cancel')"
    @confirm="emit('confirm')"
    @cancel="emit('cancel')"
  />
</template>
