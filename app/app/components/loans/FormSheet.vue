<script setup lang="ts">
// The loan forms: a bottom sheet on the phone, a dialog on the laptop. Mounted with v-if.
const props = defineProps<{
  title: string
  /** Tailwind max width of the desktop dialog. */
  width?: string
}>()

const emit = defineEmits<{
  closed: []
}>()

const isLaptop = useIsLaptop()
</script>

<template>
  <UModal
    v-if="isLaptop"
    defaultOpen
    :title="props.title"
    :ui="{ content: props.width ?? 'max-w-lg' }"
    @after:leave="emit('closed')"
  >
    <template #body="{ close }">
      <slot :close />
    </template>
  </UModal>

  <BottomSheetModal v-else @closed="emit('closed')">
    <template #default="{ close }">
      <UiTitleModal>{{ props.title }}</UiTitleModal>
      <div class="bottom-sheet-content-inside scroller-block">
        <slot :close />
      </div>
    </template>
  </BottomSheetModal>
</template>
