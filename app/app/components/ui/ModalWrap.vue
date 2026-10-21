<script setup lang="ts">
// The desktop dialog shell: the title row and close button of the popover sheets (UiPopoverWrap),
// so every desktop modal reads the same. Attributes (defaultOpen, v-model:open, @after:leave) go to UModal.
const props = defineProps<{
  contentClass?: string
  overlayClass?: string
  title: string
  titleIcon?: { color?: string, name: string }
}>()
</script>

<template>
  <UModal
    :title="props.title"
    :ui="{ content: cn('max-w-lg', props.contentClass), overlay: props.overlayClass }"
  >
    <template #content="{ close }">
      <div class="relative flex max-h-[85dvh] flex-col overflow-hidden">
        <UiTitleModal hasClose :icon="props.titleIcon">
          {{ props.title }}
          <template v-if="$slots.titleActions" #actions>
            <slot name="titleActions" />
          </template>
        </UiTitleModal>

        <UiButtonClose @click="close" />

        <div class="scroller min-h-0 overflow-y-auto overscroll-contain px-3 pb-4">
          <slot :close />
        </div>

        <div v-if="$slots.footer" class="flex justify-between gap-2 px-3 pb-3">
          <slot name="footer" :close />
        </div>
      </div>
    </template>
  </UModal>
</template>
