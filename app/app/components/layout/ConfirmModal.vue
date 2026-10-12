<script setup lang="ts">
const props = defineProps<{
  confirmLabel?: string
  description?: string
  highlight?: string
  title?: string
}>()

// Opened through useConfirm(): useOverlay passes `open` and `after:leave`, which fall through to UModal
const emit = defineEmits<{
  close: [confirmed: boolean]
}>()

const { t } = useI18n()

function confirm() {
  emit('close', true)
}

useEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    confirm()
  }
})
</script>

<template>
  <UModal
    :title="props.title ?? t('base.sure')"
    :ui="{ overlay: 'z-[70]', content: 'z-[70] max-w-sm divide-y-0', footer: 'justify-between' }"
    @update:open="(open: boolean) => !open && emit('close', false)"
  >
    <template v-if="description || highlight" #body>
      <div class="text-muted">
        {{ description }}
        <span v-if="highlight" class="font-medium text-error">
          {{ highlight }}
        </span>
      </div>
    </template>

    <template #footer="{ close }">
      <UButton
        class="px-6 text-sm"
        color="neutral"
        size="xl"
        variant="outline"
        @click="close"
      >
        {{ t('base.cancel') }}
      </UButton>

      <UButton
        autofocus
        class="px-6"
        color="error"
        size="xl"
        variant="soft"
        @click="confirm"
      >
        {{ props.confirmLabel || t('base.delete') }}
      </UButton>
    </template>
  </UModal>
</template>
