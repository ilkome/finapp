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
      <UiTitleDropdown :isActive>
        <StatDateRangeLabel />
      </UiTitleDropdown>
    </template>

    <template #content="{ close }">
      <StatDateRangePicker
        class="min-w-0 pb-2 md:min-w-90.5 md:px-3"
        @close="close"
      />
    </template>
  </BottomSheetOrDropdown>
</template>
