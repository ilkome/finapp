<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { MoverRow } from '~/components/wallets/analytics/MoversView.vue'
import type { AnalyticsBase } from '~/components/wallets/analytics/useAnalyticsBase'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { isOneOff, topMovers } from '~/components/wallets/analytics/movers'
import { formatPercent } from '~/components/wallets/analytics/tooltips'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  base: AnalyticsBase
}>()

const { t } = useI18n()
const router = useRouter()
const walletsStore = useWalletsStore()
const trnsStore = useTrnsStore()
const categoriesStore = useCategoriesStore()
const currenciesStore = useCurrenciesStore()

/** Expense per root category; `toBaseOf` prices a trn by the rates of its interval. */
function spendingByCategory(dates: { end: number, start: number }, toBaseOf: (date: number) => (amount: number, currency: string) => number) {
  const result = new Map<CategoryId, number>()
  const largest = new Map<CategoryId, number>()
  const items = trnsStore.items ?? {}
  for (const id of trnsStore.getStoreTrnsIds({ dates, walletsIds: props.base.walletIds.value })) {
    const trn = items[id]
    if (trn?.type !== 'expense' || !trn.categoryId || !trn.fromWalletId || categoriesStore.excludedFromStatsIds.has(trn.categoryId))
      continue
    const rootId = categoriesStore.items[trn.categoryId]?.parentId || trn.categoryId
    const amount = toBaseOf(trn.date)(trn.fromAmount ?? 0, walletsStore.currencyOf(trn.fromWalletId))
    result.set(rootId, (result.get(rootId) ?? 0) + amount)
    largest.set(rootId, Math.max(largest.get(rootId) ?? 0, amount))
  }
  return { largest, totals: result }
}

const movers = computed(() => {
  const previousRange = props.base.previousRange.value
  if (!previousRange)
    return []
  const current = spendingByCategory(props.base.range.value, date => props.base.toBaseAt(props.base.intervals.value.findIndex(interval => date <= interval.end)))
  const previous = spendingByCategory(previousRange, () => props.base.toBaseAt(-1))
  return topMovers(current.totals, previous.totals).map(item => ({
    ...item,
    isOneOff: isOneOff(item, { current: current.largest.get(item.id) ?? 0, previous: previous.largest.get(item.id) ?? 0 }),
  }))
})

const rows = computed<MoverRow[]>(() => movers.value.flatMap((item) => {
  const category = categoriesStore.items[item.id]
  if (!category)
    return []
  return {
    category,
    current: Math.round(item.current),
    delta: Math.round(item.delta),
    deltaLabel: item.share === undefined ? undefined : `${item.share > 0 ? '+' : ''}${formatPercent(item.share)}`,
    id: item.id,
    isOneOff: item.isOneOff,
    parentCategory: typeof category.parentId === 'string' ? categoriesStore.items[category.parentId] : undefined,
  }
}))
</script>

<template>
  <section v-if="rows.length" class="grid min-w-0 content-start gap-3" data-analytics-movers-section>
    <UiTitleSection>
      {{ t('wallets.analytics.movers.title') }}
    </UiTitleSection>
    <UiText variant="meta" class="px-2">
      {{ t('wallets.analytics.movers.caption') }}
    </UiText>
    <WalletsAnalyticsMoversView
      :currencyCode="currenciesStore.base"
      :items="rows"
      @select="id => router.push(`/categories/${id}`)"
    />
  </section>
</template>
