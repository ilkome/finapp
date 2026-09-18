<script setup lang="ts">
import { statDateRangeLabel } from '~/components/stat/date/rangeLabelText'
import { statDateKey } from '~/components/stat/injectionKeys'

const { locale, t } = useI18n()
const statDate = inject(statDateKey)!

const label = computed(() => statDateRangeLabel({
  intervalsInRange: statDate.intervalsInRange.value,
  params: statDate.params.value,
  range: statDate.range.value,
}, t, locale.value))
</script>

<template>
  <BottomSheetOrDropdown
    :title="t('dates.select')"
    :isOpen="statDate.modal.value.dateSelector"
    popoverBodyClass="md:pb-3"
    popoverContentClass="md:w-96 md:max-w-[calc(100vw-1rem)]"
    :unmountOnHide="false"
    class="flex grow-0 gap-1"
    isShowCloseBtn
    keyboardTrigger
    @openModal="statDate.modal.value.dateSelector = true"
    @closeModal="statDate.modal.value.dateSelector = false"
  >
    <template #trigger="{ isActive }">
      <UiTitleDropdown data-stat-date-range :isActive>
        <div class="flex items-center gap-1 leading-none text-nowrap capitalize">
          {{ label }}
        </div>
      </UiTitleDropdown>
    </template>

    <template #content="{ close }">
      <StatDateRangePicker
        class="min-w-0 pb-2 md:min-w-90.5 md:px-1 md:pb-0"
        @close="close"
      />
    </template>
  </BottomSheetOrDropdown>
</template>
