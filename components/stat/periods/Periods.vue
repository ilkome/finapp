<script setup lang="ts">
import { formatDateByPeriod2 } from '~/components/date/format'
import type { FilterProvider } from '~/components/filter/useFilter'
import { useAppNav } from '~/components/app/useAppNav'
import type { StatProvider } from '~/components/stat/useStat'
import { getStyles } from '~/components/ui/getStyles'

const filter = inject('filter') as FilterProvider
const stat = inject('stat') as StatProvider

const appNavStore = useAppNav()
const { t } = useI18n()

const kdkdkdkdkdl = computed(() => {
  let res = 'expenseTransactions'

  switch (appNavStore.activeTabStat) {
    case 'expense':
      res = 'expenseTransactions'
      break
    case 'income':
      res = 'incomeTransactions'
      break
    case 'summary':
      res = 'sumTransactions'
      break
  }

  return res
})

function getFormattedDate(date: number) {
  return formatDateByPeriod2(date, filter.periodNameWithoutAll.value, {
    current: t('dates.week.current'),
    last: t('dates.week.last'),
  })
}
</script>

<template>
  <div class="flex md_justify-end">
    <div class="grid gap-2 grow my-2 max-w-sm md_max-w-xs">
      <div class="grid gap-1 px-2 py-2 sm_px-1.5 sm_pt-3">
        <UiTitle2>
          {{ filter.periods.value[filter.periodNameWithoutAll.value].showedPeriods }}
          {{ filter.periodNameWithoutAll.value }}
        </UiTitle2>
        <div class="text-xs text-secondary font-mono">
          {{ getFormattedDate(stat.statPrepareData.value[0].date) }} - {{ getFormattedDate(stat.statPrepareData.value.at(-1)?.date) }}
        </div>
      </div>

      <div class="grid gap-1">
        <div
          v-for="item in stat.statPrepareData.value.slice(0, 6)"
          :key="item.date"
          :class="[
            { '!bg-item-3': item.date === filter.date.value },
            ...getStyles('item', ['link', 'bg', 'rounded', 'padding1', 'minh2']),
          ]"
          class="flex items-center font-mono"
          @click="filter.setDate(item.date)"
        >
          <div class="grow text-xs text-secondary">
            {{ getFormattedDate(item.date) }}
          </div>
          <!-- <pre>{{ item }}</pre> -->
          <Amount :amount="item[kdkdkdkdkdl]" currencyCode="RUB" />
        </div>
      </div>
    </div>
  </div>
</template>
