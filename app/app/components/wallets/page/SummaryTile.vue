<script setup lang="ts">
import { useStorage } from '@vueuse/core'

import type { SharesGroupBy, SharesMode } from '~/components/wallets/analytics/shares'

import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { computeShares, sharesModes } from '~/components/wallets/analytics/shares'
import { useCountedWalletIds } from '~/components/wallets/analytics/useAnalyticsBase'
import { WALLET_STORAGE_KEYS } from '~/components/wallets/constants'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

defineEmits<{
  click: []
}>()

const { t } = useI18n()
const walletsStore = useWalletsStore()
const currenciesStore = useCurrenciesStore()
const { walletIds } = useCountedWalletIds()
const isChartMountReady = useIdleMount()

// The breakdown the summary sheet last showed, read from the same pref.
const options = useStorage(WALLET_STORAGE_KEYS.analyticsShares, {
  groupBy: 'type' as SharesGroupBy,
  mode: 'assets' as SharesMode,
}, localStorage, { mergeDefaults: true })

// Stored before the modes were split; `gross` reads the same way.
const mode = computed<SharesMode>(() => sharesModes.includes(options.value.mode) ? options.value.mode : 'gross')
const caption = computed(() => `${t(`wallets.analytics.breakdown.${options.value.groupBy}`)} · ${t(`wallets.analytics.shares.modes.${mode.value}`)}`)

const pieData = computed(() => {
  const { items } = computeShares({
    groupBy: options.value.groupBy,
    mode: mode.value,
    toBase: currenciesStore.toBase,
    walletIds: walletIds.value,
    wallets: walletsStore.itemsComputed,
  })
  return items.map(item => ({ color: item.color, value: item.value }))
})
</script>

<template>
  <WalletsPageLinkCard
    class="h-full grid-rows-[auto_1fr_auto]"
    :title="t('wallets.analytics.summary')"
    data-summary-tile
    @click="$emit('click')"
  >
    <div class="grid h-20 place-items-center">
      <LazyStatChartPieView
        v-if="isChartMountReady && pieData.length"
        isStatic
        sizeClass="size-20"
        :pieData
        :typeLabel="t('wallets.analytics.summary')"
      />
    </div>
    <UiText variant="meta">
      {{ caption }}
    </UiText>
  </WalletsPageLinkCard>
</template>
