<script setup lang="ts">
defineProps<{
  show: boolean
  description?: string
}>()

const emit = defineEmits<{
  (e: 'onConfirm'): void
  (e: 'closed'): void
}>()
</script>

<template lang="pug">
TrnFormModal(
  v-if="show"
  @closed="$emit('closed')"
)

  template(#header)
    .pt-2.flex-center {{ $t('base.sure') }}

  template(#default="{ close }")
    .pb-2.text-alert-base.text-center(v-if="description") {{ description }}

    .pb-2.px-2.flex.justify-evenly
      ModalButton.grow(
        :name="$t('base.no')"
        icon="mdi mdi-close"
        @onClick="close"
      )
      ModalButton.grow(
        :name="$t('base.yes')"
        icon="mdi mdi-check"
        @onClick="emit('onConfirm')"
      )
</template>
