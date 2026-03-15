<script setup lang="ts">
const props = defineProps<{
  buttonLabel?: string
  hasSelection: boolean
  icon: string
  title: string
}>()

const { t } = useI18n()

const isOpen = ref(false)
</script>

<template>
  <BottomSheetOrDropdown
    :title="props.title"
    :isOpen="isOpen"
    isShowCloseBtn
    @openModal="isOpen = true"
    @closeModal="isOpen = false"
  >
    <template #trigger>
      <UTooltip :text="props.title">
        <UChip
          :show="props.hasSelection"
          color="secondary"
          inset
          size="xs"
        >
          <UButton
            :aria-label="props.title"
            :icon="props.icon"
            class="text-muted"
            color="neutral"
            size="lg"
            square
            variant="ghost"
          />
        </UChip>
      </UTooltip>
    </template>

    <template #custom="{ close }">
      <div class="grid h-full max-h-[60dvh] grid-rows-[1fr_auto] overflow-hidden">
        <slot :close="close" />

        <div class="px-3 py-2">
          <UiButtonAccent @click="close">
            {{ props.buttonLabel ?? t('base.apply') }}
          </UiButtonAccent>
        </div>
      </div>
    </template>
  </BottomSheetOrDropdown>
</template>
