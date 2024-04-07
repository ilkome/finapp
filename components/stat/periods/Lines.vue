<script setup lang="ts">
import { formatDateByPeriod2 } from '~/components/date/format'
import type { FilterProvider } from '~/components/filter/useFilter'
import { useAppNav } from '~/components/app/useAppNav'
import type { StatProvider } from '~/components/stat/useStat'
import { getStyles } from '~/components/ui/classes'

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

const opened = ref<number[]>([])
</script>

<template>
  <div class="grid gap-1">
    <div
      v-for="item in stat.statPrepareData.value"
      :key="item.date"
    >
      <div
        :class="[
          { '!bg-item-3': opened.includes(item.date) },
          ...getStyles('item', ['link', 'bg', 'rounded', 'padding1', 'minh2']),
        ]"
        class="flex items-center font-mono max-w-sm"
        @click="opened.includes(item.date) ? opened = opened.filter(d => d !== item.date) : opened.push(item.date)"
      >
        <div class="grow text-xs">
          {{ getFormattedDate(item.date) }}
        </div>
        <Amount :amount="item[kdkdkdkdkdl]" currencyCode="RUB" />
        <!-- <div class="grow text-xs text-secondary" /> -->
      </div>

      <div v-if="opened.includes(item.date)" class="pb-8">
        <!-- <pre class="text-2xs">{{ item }}</pre> -->
        <div
          v-for="(statIn, slug) in stat.getHeyTotalCategories(item.trnsIds)"
          :key="slug"
        >
          <div v-if="statIn.length > 0" class="py-2 text-secondary text-xs">
            {{ slug }}
          </div>

          <StatGroupHorizontal
            :categories="statIn"
            :moneyTypeNumber="stat.getMoneyTypeNumber(slug)"
            :moneyTypeSlug="slug"
          />
        </div>
      </div>
    </div>
  </div>
</template>
