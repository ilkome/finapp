<script setup lang="ts">
import type { CurrencyCode } from '~/components/currencies/types'

import { sparklinePoints } from '~/components/wallets/analytics/chartSeries'
import { formatPercent } from '~/components/wallets/analytics/tooltips'

export type WalletTableRow = {
  change: number
  color: string
  id: string
  name: string
  /** Share of the scope's total by size, 0..1. */
  share: number
  /** Balance per interval end, for the sparkline. */
  spark: number[]
  value: number
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

// Value and change share a cell, as they do in a row; the sparkline column has no header.
const headerCells: SortKey[][] = [['name'], [], ['value', 'change'], ['share']]
/** Fixed tracks shared by the header and every row: separate grids only line up when no track is `auto`. */
const GRID = 'grid min-w-0 grow grid-cols-[minmax(0,1fr)_3.5rem_6rem_2.5rem] items-center gap-x-2'
</script>

<template>
  <div class="grid rounded-md bg-elevated/30 py-px" data-analytics-wallets-table>
    <div class="flex items-center py-1.5 pr-9 pl-2 text-xs text-muted" role="row">
      <div :class="GRID">
        <template v-for="cell in headerCells" :key="cell.join()">
          <div class="grid gap-0.5" :class="cell[0] === 'name' ? 'justify-items-start' : 'justify-items-end'">
            <button
              v-for="column in cell"
              :key="column"
              type="button"
              class="flex items-center gap-0.5"
              :aria-label="column === 'change' ? t('wallets.analytics.table.changeFull') : undefined"
              :aria-sort="sort.key === column ? (sort.isAsc ? 'ascending' : 'descending') : 'none'"
              :data-sort="column"
              @click="setSort(column)"
            >
              {{ t(`wallets.analytics.table.${column}`) }}
              <Icon v-if="sort.key === column" :name="sort.isAsc ? 'lucide:chevron-up' : 'lucide:chevron-down'" size="12" />
            </button>
          </div>
        </template>
      </div>
    </div>

    <UiElement
      v-for="(item, index) in visible"
      :key="item.id"
      chevron="right"
      :lineWidth="index === visible.length - 1 ? 0 : 3"
      insideClasses="min-h-11!"
      :data-wallet-row="item.id"
      @click="emit('select', item.id)"
    >
      <div :class="GRID">
        <div class="flex min-w-0 items-center gap-2">
          <div class="size-2.5 shrink-0 rounded-full" :style="{ background: item.color }" />
          <UiEntityName>
            {{ item.name }}
          </UiEntityName>
        </div>
        <svg :width="SPARK_WIDTH" :height="SPARK_HEIGHT" class="shrink-0" role="img" :aria-label="sparkLabel(item.spark)">
          <polyline :points="sparkPoints(item.spark)" fill="none" :stroke="item.color" stroke-width="1.5" />
        </svg>
        <div class="grid justify-items-end gap-1">
          <Amount :amount="item.value" :currencyCode="props.currencyCode" :isShowBaseRate="false" variant="row" />
          <Amount :amount="item.change" :currencyCode="props.currencyCode" :isShowBaseRate="false" isShowPlus variant="secondary" />
        </div>
        <UiText variant="caption" class="text-right">
          {{ Math.round(item.share * 100) }}%
        </UiText>
      </div>
    </UiElement>

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
