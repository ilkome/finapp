<script setup lang="ts">
import type { AnalyticsBase } from '~/components/wallets/analytics/useAnalyticsBase'
import type { WalletTableRow } from '~/components/wallets/analytics/WalletsTableView.vue'

import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { balanceSeries, periodChange, splitOpening } from '~/components/wallets/analytics/balanceHistory'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  base: AnalyticsBase
}>()

const { t } = useI18n()
const router = useRouter()
const walletsStore = useWalletsStore()
const currenciesStore = useCurrenciesStore()

const rows = computed<WalletTableRow[]>(() => {
  const series = splitOpening(balanceSeries({
    balances: props.base.pointBalances.value,
    breakdown: 'wallet',
    maxWallets: Number.POSITIVE_INFINITY,
    scope: 'net',
    toBaseAt: props.base.toBaseAtPoint,
    walletIds: props.base.walletIds.value,
    wallets: walletsStore.items ?? {},
  }))
  // A wallet's share is of its own side: assets against assets, debts against debts.
  const sideTotal = (isDebt: boolean) => series.reduce((sum, item) => {
    const value = item.data.at(-1) ?? 0
    return (value < 0) === isDebt ? sum + Math.abs(value) : sum
  }, 0)
  const totals = { assets: sideTotal(false), debts: sideTotal(true) }
  return series
    // Nothing now and nothing moved in the period: the row says nothing.
    .filter(item => walletsStore.itemsComputed[item.id] && ((item.data.at(-1) ?? 0) !== 0 || periodChange(item) !== 0))
    .map((item) => {
      const value = item.data.at(-1) ?? 0
      const total = value < 0 ? totals.debts : totals.assets
      return {
        change: periodChange(item),
        color: item.color ?? 'var(--ui-text-muted)',
        id: item.id,
        name: item.name ?? item.id,
        share: total ? Math.abs(value) / total : 0,
        spark: item.data,
        value,
        wallet: walletsStore.itemsComputed[item.id]!,
      }
    })
})
</script>

<template>
  <section v-if="rows.length > 1" class="grid min-w-0 content-start gap-3" data-analytics-wallets-section>
    <UiTitleSection>
      {{ t('wallets.analytics.table.title') }}
    </UiTitleSection>
    <UiText variant="meta" class="px-2">
      {{ t('wallets.analytics.table.caption') }}
    </UiText>
    <WalletsAnalyticsWalletsTableView
      :currencyCode="currenciesStore.base"
      :items="rows"
      @select="id => router.push(`/wallets/${id}`)"
    />
  </section>
</template>
