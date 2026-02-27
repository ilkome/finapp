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

function onConfirm(close: () => void) {
  emit('confirm')
  close()
}

function onClosed() {
  isOpen.value = false
  emit('closed')
}
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :title="props.title || t('base.sure')"
    :ui="{ content: 'max-w-sm', footer: 'justify-between' }"
    @update:open="(val: boolean) => { if (!val) onClosed() }"
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
        variant="outline"
        color="neutral"
        size="xl"
        class="px-6 text-sm"
        @click="close"
      >
        {{ t('base.cancel') }}
      </UButton>

      <UButton
        variant="soft"
        color="error"
        size="xl"
        class="px-6"
        @click="onConfirm(close)"
      >
        {{ t('base.delete') }}
      </UButton>
    </template>
  </UModal>
</template>
