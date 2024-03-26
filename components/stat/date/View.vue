<script setup lang="ts">
import dayjs from 'dayjs'
import { getStyles } from '~/components/ui/classes'
import type { PeriodProvider } from '~/components/dashboard/Page.vue'

const { t } = useI18n()
const period = inject('period') as PeriodProvider

const formattedDate = computed(() => {
  const today = dayjs()
  const filterDate = period.date.value
  const filterPeriod = period.nameWithAll.value
  let format = 'MMMM'

  const startDate = dayjs(filterDate).startOf('week').format('D MMMM')
  const endDate = dayjs(filterDate).endOf('week').format('D MMMM')

  switch (filterPeriod) {
    case 'day':
      today.isSame(filterDate, 'year')
        ? (format = 'DD MMMM')
        : (format = 'DD MMMM YYYY')
      break

    case 'week':
      if (today.isSame(filterDate, 'week'))
        return t('dates.week.current')
      else if (today.subtract(1, filterPeriod).isSame(filterDate, 'week'))
        return t('dates.week.last')
      return `${startDate} - ${endDate}`

    case 'month':
      if (today.isSame(filterDate, 'year')) {
        format = 'MMMM'
        break
      }
      format = 'MMMM YYYY'
      break

    case 'year':
      format = 'YYYY'
      break
  }

  const fDate = dayjs(filterDate).format(format)
  return fDate[0].toUpperCase() + fDate.slice(1)
})
</script>

<template>
  <VDropdown>
    <div
      :class="getStyles('item', ['link', 'rounded'])"
      class="flex items-center px-3 py-2 text-sm font-medium leading-none text-item-1"
    >
      {{ period.nameWithAll.value === "all" ? $t("dates.all.simple") : formattedDate }}
    </div>

    <template #popper="{ hide }">
      <StatDateModal :hide="hide" />
    </template>
  </VDropdown>
</template>
