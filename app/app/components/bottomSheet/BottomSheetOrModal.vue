<script setup lang="ts">
// A form host: a bottom sheet on the phone, a dialog on the laptop. Mounted with v-if.
const props = defineProps<{
  /** The form lays out its own scroll area and bottom bar (wallet and category forms). */
  isBare?: boolean
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
      <slot v-if="props.isBare" :close />
      <div v-else class="drawer-body scroller-block">
        <slot :close />
      </div>
    </template>
  </BottomSheetModal>
</template>
