<script setup lang="ts">
const props = defineProps<{
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
    :ui="{ content: 'max-w-sm', footer: 'justify-between' }"
    @after:leave="onClosed"
  >
    <template v-if="description || highlight" #body>
      <div class="text-muted">
        {{ description }}
        <span v-if="highlight" class="font-medium text-(--ui-error)">
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
        {{ t('base.delete') }}
      </UButton>
    </template>
  </UModal>
</template>
