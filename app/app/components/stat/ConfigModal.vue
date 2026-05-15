<script setup lang="ts">
const props = defineProps<{
  labelMode?: boolean
}>()

const { t } = useI18n()

const isOpen = ref(false)
</script>

<template>
  <BottomSheetOrDropdown
    :title="t('stat.config.menu.label')"
    :isOpen
    isShowCloseBtn
    @openModal="isOpen = true"
    @closeModal="isOpen = false"
  >
    <template #trigger>
      <UiHeaderLink
        v-if="props.labelMode"
        icon="lucide:settings-2"
      >
        {{ t('stat.config.menu.label') }}
      </UiHeaderLink>

      <UTooltip
        v-else
        :text="t('stat.config.menu.label')"
      >
        <UiActionButton :ariaLabel="t('stat.config.menu.label')">
          <Icon name="lucide:settings-2" size="20" />
        </UiActionButton>
      </UTooltip>
    </template>

    <template #content="{ close }">
      <div
        class="grid gap-4 overflow-y-auto px-1 py-3 md:px-3 md:!pb-2"
        style="max-height: var(--reka-popper-available-height, 80dvh)"
      >
        <BottomSheetClose @click="close" />

        <slot :close="close" />
      </div>
    </template>
  </BottomSheetOrDropdown>
</template>
