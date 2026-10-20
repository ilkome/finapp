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
  <DrawerOrDropdown
    v-model:open="statDate.modal.value.dateSelector"
    :title="t('dates.select')"
    popoverContentClass="md:w-max md:max-w-[calc(100vw-1rem)]"
    :unmountOnHide="false"
    class="flex gap-1"
    isShowCloseBtn
    keyboardTrigger
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
        class="min-w-0 pb-2 md:min-w-90.5 md:pb-0"
        @close="close"
      />
    </template>
  </DrawerOrDropdown>
</template>
