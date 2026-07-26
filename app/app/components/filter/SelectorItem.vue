<script setup lang="ts">
const props = defineProps<{
  hasSelection: boolean
  icon: string
  labelMode?: boolean
  title: string
}>()

const { t } = useI18n()

const isOpen = ref(false)

// Touch: keep the drag-to-expand detent. Mouse (no gesture): open a full,
// scrollable sheet - `undefined` disables the detent.
const isTouch = useMediaQuery('(pointer: coarse)')
const snapPoints = computed(() => isTouch.value ? [500, 0.98] : undefined)
</script>

<template>
  <BottomSheetOrDropdown
    :title="props.title"
    :isOpen="isOpen"
    :snapPoints="snapPoints"
    isShowCloseBtn
    @openModal="isOpen = true"
    @closeModal="isOpen = false"
  >
    <template #trigger>
      <UiHeaderLink
        v-if="props.labelMode"
        :icon="props.icon"
      >
        {{ props.title }}
      </UiHeaderLink>

      <UTooltip
        v-else
        :text="props.title"
      >
        <UChip
          :show="props.hasSelection"
          color="secondary"
          inset
          size="xs"
        >
          <UiActionButton :ariaLabel="props.title">
            <Icon :name="props.icon" size="20" />
          </UiActionButton>
        </UChip>
      </UTooltip>
    </template>

    <template #custom="{ close, isExpanded }">
      <div
        class="grid grid-rows-[1fr_auto] overflow-hidden"
        :class="[
          isExpanded === undefined ? 'h-full max-h-[60dvh]' : 'h-full',
          { '[&_.scrollerBlock]:touch-none [&_.scrollerBlock]:overflow-hidden': isExpanded === false },
        ]"
      >
        <slot :close="close" />

        <div class="px-3 py-2">
          <UiButtonAccent
            rounded
            @click="close"
          >
            {{ t('base.apply') }}
          </UiButtonAccent>
        </div>
      </div>
    </template>
  </BottomSheetOrDropdown>
</template>
