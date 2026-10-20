<script setup lang="ts">
import { useStorage } from '@vueuse/core'

import type { ChartSeries } from '~/components/stat/types'
import type { AnalyticsOption } from '~/components/wallets/analytics/SettingsMenu.vue'
import type { SharesGroupBy, SharesMode, SharesSort } from '~/components/wallets/analytics/shares'
import type { AnalyticsShareRow } from '~/components/wallets/analytics/SharesView.vue'
import type { WalletId } from '~/components/wallets/types'

import { formatAmount } from '~/components/amount/utils'
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

const groupBys: SharesGroupBy[] = ['type', 'currency', 'wallet']

function nameOf(itemId: string, groupBy: SharesGroupBy) {
  const [id = itemId, side] = mode.value === 'split' ? itemId.split(':') : [itemId]
  const name = groupBy === 'type' ? t(`money.types.${id}`) : groupBy === 'wallet' ? walletsStore.items?.[id]?.name ?? id : id
  return side ? `${name} · ${t(`wallets.analytics.shares.modes.${side}`)}` : name
}

const groups = computed(() => groupBys.map((groupBy) => {
  const shares = computeShares({
    groupBy,
    mode: mode.value,
    toBase: currenciesStore.toBase,
    walletIds: props.walletIds,
    wallets: walletsStore.itemsComputed,
  })
  const list: AnalyticsShareRow[] = shares.items.map(item => ({
    color: item.color,
    count: groupBy === 'wallet' ? undefined : item.walletIds.length,
    id: item.id,
    name: nameOf(item.id, groupBy),
    share: item.share,
    signedValue: item.signedValue,
  }))
  const rows = options.value.sort === 'name' ? list.sort((a, b) => a.name.localeCompare(b.name)) : list
  return {
    groupBy,
    pieSeries: toChartSeries(rows.map(row => ({ color: row.color, data: [Math.abs(row.signedValue)], name: row.name, type: 'bar' as const })), currenciesStore.base) as ChartSeries[],
    rows,
    shares,
    totalValue: mode.value === 'gross' || mode.value === 'split' ? shares.total : rows.reduce((sum, row) => sum + row.signedValue, 0),
  }
}))

// A breakdown with a single slice says nothing; it gets no tab.
const visibleGroups = computed(() => groups.value.filter(group => group.rows.length > 1))
const activeGroup = computed(() => visibleGroups.value.find(group => group.groupBy === options.value.groupBy) ?? visibleGroups.value[0])
const groupItems = computed(() => visibleGroups.value.map(group => ({ label: t(`wallets.analytics.breakdown.${group.groupBy}`), value: group.groupBy })))

const settings = computed<AnalyticsOption[]>(() => [
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

const open = ref<{ groupBy: SharesGroupBy, id: string } | null>(null)
const openGroup = computed(() => {
  const item = open.value && groups.value.find(group => group.groupBy === open.value!.groupBy)?.shares.items.find(entry => entry.id === open.value!.id)
  return item && {
    name: nameOf(item.id, open.value!.groupBy),
    wallets: item.walletIds.map(id => ({ amount: walletsStore.itemsComputed[id]?.amount ?? 0, currencyCode: walletsStore.itemsComputed[id]?.currencyCode ?? currenciesStore.base, id, name: walletsStore.items?.[id]?.name ?? id })),
  }
})

function onSelect(id: string, groupBy: SharesGroupBy) {
  if (groupBy === 'wallet')
    router.push(`/wallets/${id.split(':')[0]}`)
  else
    open.value = { groupBy, id }
}

function onSelectSlice(name: string, groupBy: SharesGroupBy) {
  const row = groups.value.find(group => group.groupBy === groupBy)?.rows.find(item => item.name === name)
  if (row)
    onSelect(row.id, groupBy)
}
</script>

<template>
  <section class="grid min-w-0 content-start gap-3 @3xl/page:col-span-2" data-analytics-shares-section>
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
      :items="settings[0]!.items"
      :modelValue="mode"
      size="xs"
      variant="flat"
      :grow="false"
      :itemGrow="false"
      align="left"
      @update:modelValue="value => onSetting('mode', value)"
    />

    <template v-if="activeGroup">
      <UiTabs
        v-if="groupItems.length > 1"
        :items="groupItems"
        :modelValue="activeGroup.groupBy"
        size="sm"
        data-shares-group-tabs
        @update:modelValue="value => onSetting('groupBy', value)"
      />
      <div class="grid content-start gap-3 @3xl/page:grid-cols-[minmax(0,18rem)_1fr] @3xl/page:items-start @3xl/page:gap-8" :data-shares-group="activeGroup.groupBy">
        <div class="mx-auto h-48 w-full max-w-xs">
          <LazyStatChartSimplePieView
            v-if="isChartMountReady"
            isDonut
            :isShowLabels="false"
            isShowPercent
            :centerLabel="formatAmount(activeGroup.totalValue, currenciesStore.base)"
            :series="activeGroup.pieSeries"
            :xAxisLabels="[0]"
            @selectSlice="name => onSelectSlice(name, activeGroup!.groupBy)"
          />
        </div>
        <WalletsAnalyticsSharesView
          :currencyCode="currenciesStore.base"
          :isRowSheet="activeGroup.groupBy !== 'wallet'"
          :items="activeGroup.rows"
          :totalLabel="t('wallets.analytics.shares.total')"
          :totalValue="activeGroup.totalValue"
          @select="id => onSelect(id, activeGroup!.groupBy)"
        />
      </div>
    </template>

    <UiText v-if="!visibleGroups.length" variant="meta" class="px-2">
      {{ t('wallets.analytics.shares.empty') }}
    </UiText>

    <UiSheet
      v-if="openGroup"
      modalClass="max-w-md"
      :title="openGroup.name"
      @closed="open = null"
    >
      <div class="grid pb-3">
        <UiElement
          v-for="wallet in openGroup.wallets"
          :key="wallet.id"
          :data-share-wallet="wallet.id"
          @click="router.push(`/wallets/${wallet.id}`)"
        >
          <div class="min-w-0 grow truncate text-sm">
            {{ wallet.name }}
          </div>
          <Amount :amount="wallet.amount" :currencyCode="wallet.currencyCode" variant="row" />
          <Icon name="lucide:chevron-right" size="16" class="shrink-0 text-dimmed" aria-hidden="true" />
        </UiElement>
      </div>
    </UiSheet>
  </section>
</template>
