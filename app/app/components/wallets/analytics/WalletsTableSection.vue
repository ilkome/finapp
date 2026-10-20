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
  const total = series.reduce((sum, item) => sum + Math.abs(item.data.at(-1) ?? 0), 0)
  return series.map(item => ({
    change: periodChange(item),
    color: item.color ?? 'var(--ui-text-muted)',
    id: item.id,
    name: item.name ?? item.id,
    share: total ? Math.abs(item.data.at(-1) ?? 0) / total : 0,
    spark: item.data,
    value: item.data.at(-1) ?? 0,
  }))
})
</script>

<template>
  <section v-if="rows.length > 1" class="grid min-w-0 content-start gap-3" data-analytics-wallets-section>
    <UiTitleSection>
      {{ t('wallets.analytics.table.title') }}
    </UiTitleSection>
    <WalletsAnalyticsWalletsTableView
      :currencyCode="currenciesStore.base"
      :items="rows"
      @select="id => router.push(`/wallets/${id}`)"
    />
  </section>
</template>
