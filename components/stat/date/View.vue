<script setup lang="ts">
import dayjs from 'dayjs'
import { getStyles } from '~/components/ui/classes'
import type { PeriodProvider } from '~/components/dashboard/Page.vue'
import type { PeriodNameWithoutAll } from '~/components/stat/chart/useChartStore'

const period = inject('period') as PeriodProvider

const { t } = useI18n()
const formattedDate = computed(() => formatDateByPeriod(period.date.value, period.nameWithoutAll.value))

function formatDateByPeriod(date: number, periodName: PeriodNameWithoutAll) {
  const today = dayjs()
  let format = 'MMMM'

  const startDate = dayjs(date).startOf('week').format('D MMMM')
  const endDate = dayjs(date).endOf('week').format('D MMMM')

  switch (periodName) {
    case 'day':
      today.isSame(date, 'year')
        ? (format = 'DD MMMM')
        : (format = 'DD MMMM YYYY')
      break

    case 'week':
      if (today.isSame(date, 'week'))
        return t('dates.week.current')
      else if (today.subtract(1, periodName).isSame(date, 'week'))
        return t('dates.week.last')
      return `${startDate} - ${endDate}`

    case 'month':
      if (today.isSame(date, 'year')) {
        format = 'MMMM'
        break
      }
      format = 'MMMM YYYY'
      break

    case 'year':
      format = 'YYYY'
      break
  }

  return dayjs(date).format(format)
  // const fDate = dayjs(date).format(format)
  // return fDate[0].toUpperCase() + fDate.slice(1)
}
</script>

<template>
  <VDropdown>
    <div
      :class="getStyles('item', ['link', 'rounded'])"
      class="flex items-center px-3 py-2 text-base font-medium leading-none text-item-1"
    >
      {{ period.nameWithAll.value === "all" ? $t("dates.all.simple") : formattedDate }}
    </div>

    <template #popper="{ hide }">
      <StatDateModal :hide="hide" />
    </template>
  </VDropdown>
</template>
