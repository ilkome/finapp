<script setup lang="ts">
const props = defineProps<{
  hasSelection: boolean
  icon: string
  labelMode?: boolean
  title: string
}>()

const { t } = useI18n()

const isOpen = ref(false)
</script>

<template>
  <BottomSheetOrDropdown
    :title="props.title"
    :isOpen="isOpen"
    :snapPoints="[0.3, 0.9]"
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
          <UiButtonAccent class="rounded-full" @click="close">
            {{ t('base.apply') }}
          </UiButtonAccent>
        </div>
      </div>
    </template>
  </BottomSheetOrDropdown>
</template>
