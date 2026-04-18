<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import BaseModal from '../shared/ui/base/BaseModal.vue'

const { t: $t } = useI18n()

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
    :confirm-text="$t('common.delete')"
    :cancel-text="$t('common.cancel')"
    confirm-variant="danger"
    @update:model-value="$emit('cancel')"
    @confirm="emit('confirm')"
    @cancel="emit('cancel')"
  />
</template>
