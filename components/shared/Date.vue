<script setup lang="ts">
import dayjs from 'dayjs'

const props = defineProps<{
  date: number
  period: String
}>()

const { nuxt2Context: { i18n } } = useNuxtApp()

const formattedDate = computed(() => {
  const today = dayjs()
  const filterDate = props.date
  const filterPeriod = props.period
  let format = 'MMMM'

  switch (filterPeriod) {
    case 'day':
      today.isSame(filterDate, 'year')
        ? format = 'DD MMMM'
        : format = 'DD MMMM YYYY'
      break

    case 'week':
      if (today.isSame(filterDate, 'week'))
        return i18n.t('dates.week.current')

      else if (today.subtract(1, filterPeriod).isSame(filterDate, 'week'))
        return i18n.t('dates.week.last')

      const date = dayjs(filterDate)
      const startDate = date.startOf('week').format('D MMMM')
      const endDate = date.endOf('week').format('D MMMM')
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

<template lang="pug">
div
  template(v-if="period === 'all'") {{ $t('dates.all.simple') }}
  template(v-if="period !== 'all'") {{ formattedDate }}
</template>
