<script setup lang="ts">
import type { DateUTC } from '~/components/date/types'
import type { PeriodNameWithAll, PeriodNameWithoutAll, Periods, PeriodsNames } from '~/components/filter/useFilter'
import { formatDateByPeriod } from '~/components/date/format'
import { getStyles } from '~/components/ui/getStyles'

const props = defineProps<{
  date: DateUTC
  periodNameWithAll: PeriodNameWithAll
  periods: Periods
  periodsNames: PeriodsNames
}>()

const emit = defineEmits<{
  setPeriodAndDate: [slug: PeriodNameWithoutAll]
}>()

const { t } = useI18n()
const formattedDate = computed(() => formatDateByPeriod(props.date, props.periodNameWithAll, {
  current: t('dates.week.current'),
  last: t('dates.week.last'),
}))
</script>

<template>
  <VDropdown
    :overflowPadding="12"
    autoBoundaryMaxSize
    placement="bottom-start"
    class="grow"
  >
    <div
      :class="getStyles('item', ['link', 'rounded', 'minh2', 'center'])"
      class="flex items-center px-3 py-2 text-base font-medium leading-none text-item-1"
    >
      {{ props.periodNameWithAll === "all" ? $t("dates.all.simple") : formattedDate }}
    </div>

    <template #popper="{ hide }">
      <StatDateModal
        :hide="hide"
        :periods="props.periods"
        :periodsNames="props.periodsNames"
        :periodNameWithAll="props.periodNameWithAll"
        @setPeriodAndDate="slug => emit('setPeriodAndDate', slug)"
      />
    </template>
  </VDropdown>
</template>
