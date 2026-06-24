<script setup lang="ts">
const props = defineProps<{
  confirmLabel?: string
  description?: string
  highlight?: string
  title?: string
}>()

const emit = defineEmits<{
  closed: []
  confirm: []
}>()

const { t } = useI18n()

const isOpen = ref(true)

function confirm() {
  emit('confirm')
  isOpen.value = false
}

function onClosed() {
  emit('closed')
}

useEventListener('keydown', (e: KeyboardEvent) => {
  if (!isOpen.value)
    return

  if (e.key === 'Enter') {
    e.preventDefault()
    confirm()
  }
})
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :title="props.title || t('base.sure')"
    :ui="{ overlay: 'z-[70]', content: 'z-[70] max-w-sm divide-y-0', footer: 'justify-between' }"
    @after:leave="onClosed"
  >
    <template #close>
      <BottomSheetClose />
    </template>

    <template v-if="description || highlight" #body>
      <div class="text-muted">
        {{ description }}
        <span v-if="highlight" class="text-error font-medium">
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
