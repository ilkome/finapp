<script setup lang="ts">
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { formatDateByPeriod2 } from '~/components/date/format'
import type { FilterProvider } from '~/components/filter/useFilter'
import type { StatProvider } from '~/components/stat/useStat'
import { getStyles } from '~/components/ui/getStyles'

const props = withDefaults(defineProps<{
  type?: 'expense' | 'income' | 'summary'
}>(), {
  type: 'summary',
})

const filter = inject('filter') as FilterProvider
const stat = inject('stat') as StatProvider

const currenciesStore = useCurrenciesStore()
const { t } = useI18n()

function getWidthPercent(value: number, biggest: number): string {
  return `${(Math.abs(value) / Math.abs(biggest)) * 100}%`
}

const biggest = computed(() => {
  return Math.max(
    ...stat.statPrepareData.value.map(item => item[props.type]),
  )
})

function getBarWidth(item: any) {
  return {
    width: getWidthPercent(item, biggest.value),
  }
}

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
      :class="[
        { '!bg-item-4 border-item-5 rounded-md': opened.includes(item.date) },
        ...getStyles('item', ['link', 'rounded', 'minh2']),
      ]"
      class="border border-transparent"
    >
      <div
        :class="[
          ...getStyles('item', ['padding1']),
        ]"
        @click="opened.includes(item.date) ? opened = opened.filter(d => d !== item.date) : opened.push(item.date)"
      >
        <div class="flex items-center">
          <div class="grow text-xs">
            {{ getFormattedDate(item.date) }}
          </div>

          <Amount
            :amount="item[props.type]"
            :currencyCode="currenciesStore.base"
          />
        </div>

        <div class="mt-1 rounded-[3px] bg-item-5">
          <div
            :style="getBarWidth(item[props.type])"
            class="h-1 bg-item-2 rounded-md overflow-hidden"
          />
        </div>
      </div>

      <div v-if="opened.includes(item.date)">
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
