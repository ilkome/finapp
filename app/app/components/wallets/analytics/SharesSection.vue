<script setup lang="ts">
import { useStorage } from '@vueuse/core'

import type { ChartSeries } from '~/components/stat/types'
import type { AnalyticsOption } from '~/components/wallets/analytics/SettingsMenu.vue'
import type { SharesGroupBy, SharesMode, SharesSort } from '~/components/wallets/analytics/shares'
import type { AnalyticsShareRow } from '~/components/wallets/analytics/SharesView.vue'
import type { WalletId } from '~/components/wallets/types'

import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { toChartSeries } from '~/components/wallets/analytics/chartSeries'
import { computeShares, sharesModes } from '~/components/wallets/analytics/shares'
import { WALLET_STORAGE_KEYS } from '~/components/wallets/constants'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  walletIds: WalletId[]
}>()

const { t } = useI18n()
const router = useRouter()
const walletsStore = useWalletsStore()
const currenciesStore = useCurrenciesStore()
const isChartMountReady = useIdleMount()

const options = useStorage(WALLET_STORAGE_KEYS.analyticsShares, {
  groupBy: 'type' as SharesGroupBy,
  mode: 'assets' as SharesMode,
  sort: 'amount' as SharesSort,
}, localStorage, { mergeDefaults: true })

// Stored before the modes were split; `gross` reads the same way.
const mode = computed<SharesMode>(() => sharesModes.includes(options.value.mode) ? options.value.mode : 'gross')

const shares = computed(() => computeShares({
  groupBy: options.value.groupBy,
  mode: mode.value,
  toBase: currenciesStore.toBase,
  walletIds: props.walletIds,
  wallets: walletsStore.itemsComputed,
}))

function nameOf(itemId: string) {
  const [id = itemId, side] = mode.value === 'split' ? itemId.split(':') : [itemId]
  const name = groupNameOf(id)
  return side ? `${name} · ${t(`wallets.analytics.shares.modes.${side}`)}` : name
}

function groupNameOf(id: string) {
  if (options.value.groupBy === 'type')
    return t(`money.types.${id}`)
  if (options.value.groupBy === 'wallet')
    return walletsStore.items?.[id]?.name ?? id
  return id
}

const rows = computed<AnalyticsShareRow[]>(() => {
  const list = shares.value.items.map(item => ({
    color: item.color,
    count: options.value.groupBy === 'wallet' ? undefined : item.walletIds.length,
    id: item.id,
    name: nameOf(item.id),
    share: item.share,
    signedValue: item.signedValue,
  }))
  return options.value.sort === 'name' ? list.sort((a, b) => a.name.localeCompare(b.name)) : list
})

const pieSeries = computed<ChartSeries[]>(() => toChartSeries(rows.value.map(row => ({ color: row.color, data: [Math.abs(row.signedValue)], name: row.name, type: 'bar' })), currenciesStore.base))

const settings = computed<AnalyticsOption[]>(() => [
  {
    id: 'groupBy',
    items: (['type', 'currency', 'wallet'] as const).map(value => ({ label: t(`wallets.analytics.breakdown.${value}`), value })),
    label: t('wallets.analytics.breakdown.label'),
    value: options.value.groupBy,
  },
  {
    id: 'mode',
    items: sharesModes.map(value => ({ label: t(`wallets.analytics.shares.modes.${value}`), value })),
    label: t('wallets.analytics.shares.modes.label'),
    value: mode.value,
  },
  {
    id: 'sort',
    items: (['amount', 'name'] as const).map(value => ({ label: t(`wallets.analytics.sort.${value}`), value })),
    label: t('wallets.analytics.sort.label'),
    value: options.value.sort,
  },
])

function onSetting(id: string, value: number | string) {
  options.value = { ...options.value, [id]: value }
}

function onSelect(id: string) {
  if (options.value.groupBy === 'wallet')
    router.push(`/wallets/${id.split(':')[0]}`)
}
</script>

<template>
  <section class="grid min-w-0 content-start gap-3" data-analytics-shares-section>
    <div class="flex items-center gap-2">
      <UiTitleSection class="grow">
        {{ t('wallets.analytics.shares.title') }}
      </UiTitleSection>
      <WalletsAnalyticsSettingsMenu
        :options="settings"
        :title="t('wallets.analytics.shares.title')"
        @change="onSetting"
      />
    </div>

    <UiTabs
      :items="settings[1]!.items"
      :modelValue="mode"
      size="xs"
      variant="flat"
      :grow="false"
      :itemGrow="false"
      align="left"
      @update:modelValue="value => onSetting('mode', value)"
    />

    <div v-if="rows.length > 1" class="mx-auto h-48 w-full max-w-xs">
      <LazyStatChartSimplePieView
        v-if="isChartMountReady"
        isDonut
        :isShowLabels="false"
        isShowPercent
        :series="pieSeries"
        :xAxisLabels="[0]"
      />
    </div>

    <WalletsAnalyticsSharesView
      v-if="rows.length"
      :currencyCode="currenciesStore.base"
      :items="rows"
      :totalLabel="t('wallets.analytics.shares.total')"
      :totalValue="mode === 'gross' || mode === 'split' ? shares.total : rows.reduce((sum, row) => sum + row.signedValue, 0)"
      @select="onSelect"
    />

    <UiText v-else variant="meta" class="px-2">
      {{ t('wallets.analytics.shares.empty') }}
    </UiText>
  </section>
</template>
