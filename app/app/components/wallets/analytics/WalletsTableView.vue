<script setup lang="ts">
import type { CurrencyCode } from '~/components/currencies/types'
import type { WalletId, WalletItemComputed } from '~/components/wallets/types'

import { sparklinePoints } from '~/components/wallets/analytics/chartSeries'
import { formatPercent } from '~/components/wallets/analytics/tooltips'

export type WalletTableRow = {
  change: number
  color: string
  id: WalletId
  /** For sorting by name. */
  name: string
  /** Share of the scope's total by size, 0..1. */
  share: number
  /** Balance per interval end, for the sparkline. */
  spark: number[]
  /** Balance in the base currency, for sorting by size. */
  value: number
  wallet: WalletItemComputed
}

type SortKey = 'change' | 'name' | 'share' | 'value'

const props = defineProps<{
  currencyCode: CurrencyCode
  items: WalletTableRow[]
}>()

const emit = defineEmits<{
  select: [id: string]
}>()

const { t } = useI18n()
/** Rows shown before "Show all". */
const COLLAPSED_ROWS = 8
const isExpanded = ref(false)
const sort = ref<{ isAsc: boolean, key: SortKey }>({ isAsc: false, key: 'value' })

const sorted = computed(() => props.items.toSorted((a, b) => {
  const { isAsc, key } = sort.value
  const order = key === 'name' ? a.name.localeCompare(b.name) : a[key] - b[key]
  return isAsc ? order : -order
}))

const visible = computed(() => isExpanded.value ? sorted.value : sorted.value.slice(0, COLLAPSED_ROWS))

function setSort(key: SortKey) {
  sort.value = { isAsc: sort.value.key === key ? !sort.value.isAsc : key === 'name', key }
}

const SPARK_WIDTH = 56
const SPARK_HEIGHT = 18
function sparkPoints(values: number[]) {
  return sparklinePoints(values, SPARK_WIDTH, SPARK_HEIGHT).map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
}

function sparkLabel(values: number[]) {
  const first = values[0] ?? 0
  const last = values.at(-1) ?? 0
  const trend = last > first ? 'up' : last < first ? 'down' : 'flat'
  return t(`wallets.analytics.table.trend.${trend}`, { percent: first ? formatPercent(Math.abs((last - first) / first)) : '' })
}

const columns: SortKey[] = ['name', 'value', 'change', 'share']
</script>

<template>
  <div class="grid rounded-md bg-elevated/30 py-px" data-analytics-wallets-table>
    <div class="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 px-3 py-1.5 text-xs text-muted" role="toolbar" :aria-label="t('wallets.analytics.sort.label')">
      <button
        v-for="column in columns"
        :key="column"
        type="button"
        class="flex items-center gap-0.5"
        :class="sort.key === column && 'text-toned'"
        :aria-label="column === 'change' ? t('wallets.analytics.table.changeFull') : undefined"
        :aria-pressed="sort.key === column"
        :data-sort="column"
        @click="setSort(column)"
      >
        {{ t(`wallets.analytics.table.${column}`) }}
        <Icon v-if="sort.key === column" :name="sort.isAsc ? 'lucide:chevron-up' : 'lucide:chevron-down'" size="12" />
      </button>
    </div>

    <WalletsItem
      v-for="(item, index) in visible"
      :key="item.id"
      :baseCurrencyCode="props.currencyCode"
      chevron="right"
      :data-wallet-row="item.id"
      isShowBaseRate
      isShowCreditLimit
      isShowIcon
      isShowRate
      :lineWidth="index === visible.length - 1 ? 0 : 1"
      :wallet="item.wallet"
      :walletId="item.id"
      @click="emit('select', item.id)"
    >
      <template #append>
        <svg :width="SPARK_WIDTH" :height="SPARK_HEIGHT" class="shrink-0" role="img" :aria-label="sparkLabel(item.spark)">
          <polyline :points="sparkPoints(item.spark)" fill="none" :stroke="item.color" stroke-width="1.5" />
        </svg>
        <div class="grid w-16 shrink-0 justify-items-end gap-1">
          <Amount :amount="item.change" :currencyCode="props.currencyCode" :isShowBaseRate="false" isShowPlus variant="secondary" />
          <UiText variant="caption">
            {{ Math.round(item.share * 100) }}%
          </UiText>
        </div>
      </template>
    </WalletsItem>

    <UButton
      v-if="sorted.length > COLLAPSED_ROWS"
      color="neutral"
      variant="link"
      size="sm"
      class="justify-self-start px-3"
      data-wallets-table-toggle
      @click="isExpanded = !isExpanded"
    >
      {{ isExpanded ? t('wallets.analytics.hide') : t('wallets.analytics.table.showAll', { count: sorted.length }) }}
    </UButton>
  </div>
</template>
