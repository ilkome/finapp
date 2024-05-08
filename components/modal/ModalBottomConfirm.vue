<script setup lang="ts">
defineProps<{
  description?: string
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'closed'): void
  (e: 'onConfirm'): void
}>()
</script>

<template>
  <TrnFormModal v-if="show" @closed="emit('closed')">
    <template #header>
      <div class="pt-2 flex-center">
        {{ $t('base.sure') }}
      </div>
    </template>

    <template #default="{ close }">
      <div v-if="description" class="pb-2 text-alert-primary text-center">
        {{ description }}
      </div>
      <div class="pb-2 px-2 flex justify-evenly bg-foreground-2 z-50">
        <ModalButton :name="$t('base.no')" icon="mdi mdi-close" @onClick="close" />
        <ModalButton :name="$t('base.yes')" icon="mdi mdi-check" @onClick="emit('onConfirm')" />
      </div>
    </template>
  </TrnFormModal>
</template>
