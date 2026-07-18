<script setup lang="ts">
import { statDateKey } from '~/components/stat/injectionKeys'

const { t } = useI18n()
const statDate = inject(statDateKey)!
</script>

<template>
  <BottomSheetOrDropdown
    :title="t('dates.select')"
    :isOpen="statDate.modal.value.dateSelector"
    :unmountOnHide="false"
    class="flex grow-0 gap-1"
    isShowCloseBtn
    keyboardTrigger
    @openModal="statDate.modal.value.dateSelector = true"
    @closeModal="statDate.modal.value.dateSelector = false"
  >
    <template #trigger="{ isActive }">
      <UiTitleCollapse
        class="text-md bg-elevated/30 !grow-0"
        isShown
      >
        <span class="flex items-center gap-1 text-xs font-medium tracking-normal md:text-base md:font-semibold md:tracking-wide">
          <StatDateRange />
          <Icon
            name="lucide:chevron-down"
            size="18"
            class="text-muted shrink-0 transition-transform"
            :class="isActive && 'rotate-180'"
          />
        </span>
      </UiTitleCollapse>
    </template>

    <template #content="{ close }">
      <StatDateSelector
        class="min-w-0 pb-2 md:min-w-[362px] md:px-3"
        @close="close"
      />
    </template>
  </BottomSheetOrDropdown>
</template>
