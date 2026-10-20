<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { MoverRow } from '~/components/wallets/analytics/MoversView.vue'
import type { AnalyticsBase } from '~/components/wallets/analytics/useAnalyticsBase'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { topMovers } from '~/components/wallets/analytics/movers'
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
  const items = trnsStore.items ?? {}
  for (const id of trnsStore.getStoreTrnsIds({ dates, walletsIds: props.base.walletIds.value })) {
    const trn = items[id]
    if (trn?.type !== 'expense' || !trn.categoryId || !trn.fromWalletId || categoriesStore.excludedFromStatsIds.has(trn.categoryId))
      continue
    const rootId = String(categoriesStore.items[trn.categoryId]?.parentId ?? trn.categoryId)
    result.set(rootId, (result.get(rootId) ?? 0) + toBaseOf(trn.date)(trn.fromAmount ?? 0, walletsStore.currencyOf(trn.fromWalletId)))
  }
  return result
}

const movers = computed(() => {
  const previousRange = props.base.previousRange.value
  if (!previousRange)
    return []
  const current = spendingByCategory(props.base.range.value, date => props.base.toBaseAt(props.base.intervals.value.findIndex(interval => date <= interval.end)))
  const previous = spendingByCategory(previousRange, () => props.base.toBaseAt(-1))
  return topMovers(current, previous)
})

const rows = computed<MoverRow[]>(() => movers.value.map((item) => {
  const category = categoriesStore.items[item.id]
  return {
    color: category?.color ?? 'var(--ui-text-muted)',
    current: Math.round(item.current),
    delta: Math.round(item.delta),
    deltaLabel: item.share === undefined ? undefined : `${item.share > 0 ? '+' : ''}${formatPercent(item.share)}`,
    icon: category?.icon ?? 'lucide:circle',
    id: item.id,
    name: category?.name ?? item.id,
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
