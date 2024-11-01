<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import type { CategoryId } from '~/components/categories/types'
import type { FilterProvider } from '~/components/filter/types'
import type { MiniItemConfig } from '~/components/stat/types'
import type { StatTabs } from '~/components/app/types'
import type { WalletId } from '~/components/wallets/types'
import useAmount from '~/components/amount/useAmount'
import { chartViewOptions } from '~/components/stat/types'
import { getStyles } from '~/components/ui/getStyles'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const props = defineProps<{
  categoriesIds?: CategoryId[]
  isShowFilter?: boolean
  isShowTotals?: boolean
  storageKey?: string
  walletsIds?: WalletId[]
}>()

const filter = inject('filter') as FilterProvider
const { t } = useI18n()
const trnsStore = useTrnsStore()
const { getTotalOfTrnsIds } = useAmount()

const activeTab = useStorage<StatTabs>(`${props.storageKey}-mini-tab`, 'netIncome')

const trnsIds = computed(() => trnsStore.getStoreTrnsIds({
  categoriesIds: filter.catsIds.value.length > 0 ? filter.catsIds.value : props.categoriesIds,
  walletsIds: filter.walletsIds.value.length > 0 ? filter.walletsIds.value : props.walletsIds,
}, {
  includesChildCategories: true,
}))

const expenseTrnsIds = computed(() =>
  trnsIds.value.filter(
    trnId => trnsStore.items[trnId].type === 0 || trnsStore.items[trnId].type === 2,
  ).sort(
    (a, b) => trnsStore.items[b].date - trnsStore.items[a].date,
  ),
)

const incomeTrnsIds = computed(() =>
  trnsIds.value.filter(
    trnId => trnsStore.items[trnId].type === 1 || trnsStore.items[trnId].type === 2,
  ).sort(
    (a, b) => trnsStore.items[b].date - trnsStore.items[a].date,
  ),
)

const totals = computed(() => getTotalOfTrnsIds(trnsIds.value))

const config = ref<MiniItemConfig>({
  chartView: 'full',
  update: (key, value) => {
    config.value[key] = value
  },
})
</script>

<template>
  <div class="bg-foreground-3 sticky top-0 z-10 max-w-6xl pb-2 lg:gap-8 lg:px-4 xl:py-2">
    <div class="grid gap-2 px-2 pt-2">
      <div class="flex items-center gap-1 overflow-x-auto ">
        <FilterSelector v-if="props.isShowFilter" />
        <StatMenu
          :active="activeTab"
          @click="id => activeTab = id"
        />
        <UPopover
          class="ml-auto hidden md:block"
          :popper="{ placement: 'bottom-end' }"
        >
          <UiItem3>
            <Icon name="lucide:settings-2" class="size-5" />
          </UiItem3>

          <template #panel>
            <div class="p-3">
              <UiTitle3 class="pb-2">
                {{ t("stat.config.chartView.label") }}
              </UiTitle3>
              <UiTabs>
                <UiTabsItem
                  v-for="view in chartViewOptions"
                  :key="view"
                  :isActive="config.chartView === view"
                  @click="config.update('chartView', view)"
                >
                  {{ t(`stat.config.chartView.${view}`) }}
                </UiTabsItem>
              </UiTabs>
            </div>
          </template>
        </UPopover>
      </div>
      <FilterSelected v-if="filter.isShow?.value" />
    </div>

    <WalletsList
      v-if="!filter?.isShow?.value"
      v-slot="{ walletsItemsLimited }"
      :limit="4"
      class="flex gap-1 overflow-hidden overflow-x-auto p-2 pb-0"
    >
      <WalletsItem
        v-for="(wallet, walletId) in walletsItemsLimited"
        :key="walletId"
        :activeItemId="filter.walletsIds.value.includes(`${walletId}`) ? walletId : null"
        :walletId
        :wallet
        alt
        :class="getStyles('item', ['alt', 'rounded'])"
        @click="filter.toggleWalletId(walletId)"
      />
    </WalletsList>
  </div>

  <!-- NetIncome -->
  <StatMiniItem
    v-if="activeTab === 'netIncome' && totals.sum && (totals.expense !== 0 || totals.income !== 0)"
    :storageKey="props.storageKey + activeTab"
    :trnsIds="trnsIds"
    :config
    class="-max-w-2xl max-w-6xl pb-24 lg:gap-8 lg:px-4 xl:py-2"
    type="sum"
  />

  <!-- Summary -->
  <div
    v-if="activeTab === 'sum'"
    class="grid max-w-6xl gap-4 pb-24 md:grid-cols-2 lg:gap-8 lg:px-4 xl:py-2"
  >
    <!-- Expense -->
    <StatMiniItem
      v-if="(activeTab === 'sum') && expenseTrnsIds.length > 0"
      :config
      :storageKey="props.storageKey + activeTab"
      :trnsIds="expenseTrnsIds"
      type="expense"
    />

    <!-- Income -->
    <StatMiniItem
      v-if="(activeTab === 'sum') && incomeTrnsIds.length > 0"
      :config
      :storageKey="props.storageKey + activeTab"
      :trnsIds="incomeTrnsIds"
      type="income"
    />
  </div>
</template>
