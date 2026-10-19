<script setup lang="ts">
import { addCivilMonths, lastDayOfMonthCivil, startOfMonthCivil } from '~~/utils/date/civil'

import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { balanceSeries, walletBalancesAt } from '~/components/wallets/analytics/balanceHistory'
import { useCountedWalletIds } from '~/components/wallets/analytics/useAnalyticsBase'
import { useForecast } from '~/components/wallets/analytics/useForecast'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

/** Months of history the sparkline draws, the current one included. */
const PREVIEW_MONTHS = 6

const { t } = useI18n()
const router = useRouter()
const walletsStore = useWalletsStore()
const trnsStore = useTrnsStore()
const currenciesStore = useCurrenciesStore()
const { walletIds } = useCountedWalletIds()
const { forecast, runwayOf, today } = useForecast()

// Month ends, today for the current one, at today's rates: a glance, not the full history chart.
const points = computed(() => {
  const first = startOfMonthCivil(today.value)
  const ends = Array.from({ length: PREVIEW_MONTHS }, (_, index) =>
    index === PREVIEW_MONTHS - 1 ? today.value : lastDayOfMonthCivil(addCivilMonths(first, index + 1 - PREVIEW_MONTHS)))
  return balanceSeries({
    balances: walletBalancesAt(trnsStore.items ?? {}, walletsStore.items ?? {}, ends),
    breakdown: 'total',
    scope: 'net',
    toBaseAt: () => currenciesStore.toBase,
    walletIds: walletIds.value,
    wallets: walletsStore.items ?? {},
  })[0]?.data ?? []
})
</script>

<template>
  <WalletsAnalyticsPreviewView
    :change="(points.at(-1) ?? 0) - (points[0] ?? 0)"
    :changeLabel="t('wallets.analytics.preview.change', { n: PREVIEW_MONTHS })"
    :currencyCode="currenciesStore.base"
    :points
    :runway="runwayOf(forecast.runwayWithoutIncome)"
    @click="router.push('/wallets/analytics')"
  />
</template>
