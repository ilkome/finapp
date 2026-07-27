<script setup lang="ts">
const props = defineProps<{
  hasSelection: boolean
  icon: string
  labelMode?: boolean
  title: string
}>()

const { t } = useI18n()

const isOpen = ref(false)

const snapPoints = useSheetSnapPoints()
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
      <UiTriggerButton
        :hasSelection="props.hasSelection"
        :icon="props.icon"
        :labelMode="props.labelMode"
        :title="props.title"
      />
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
