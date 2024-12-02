<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import type { StatTabs } from '~/components/app/types'
import type { WalletId } from '~/components/wallets/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { useStatConfig } from '~/components/stat/useStatConfig'
import { useFilter } from '~/components/filter/useFilter'
import { useStatDate } from '~/components/date/useStatDate'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

const { t } = useI18n()
const filter = useFilter()
const route = useRoute()
const trnsFormStore = useTrnsFormStore()
const trnsStore = useTrnsStore()
const walletsStore = useWalletsStore()
provide('filter', filter)

const trnsIds = computed(() => trnsStore.getStoreTrnsIds({
  categoriesIds: filter?.categoriesIds?.value,
  walletsIds: filter?.walletsIds?.value,
}, {
  includesChildCategories: true,
}))
const maxRange = computed(() => trnsStore.getRange(trnsIds.value))

const statConfig = useStatConfig({ storageKey: 'dashboard' })
provide('statConfig', statConfig)

watch(filter.categoriesIds, () => {
  if (filter.categoriesIds.value.length > 0) {
    statConfig.config.value.isShowEmptyCategories = true
  }
  else {
    statConfig.config.value.isShowEmptyCategories = false
  }
})

const statDate = useStatDate({
  key: `finapp-dashboard-`,
  maxRange,
  queryParams: route.query,
})
provide('statDate', statDate)

const activeTab = useStorage<StatTabs>(`dashboard-mini-tab`, 'netIncome')
const storageKey = computed(() => `dashboard${activeTab.value}`)

const expenseTrnsIds = computed(() => trnsStore.getStoreTrnsIds({
  trnsIds: trnsIds.value,
  trnsTypes: [0, 2],
}, {
  includesChildCategories: true,
}))

const incomeTrnsIds = computed(() => trnsStore.getStoreTrnsIds({
  trnsIds: trnsIds.value,
  trnsTypes: [1, 2],
}, {
  includesChildCategories: true,
}))

const sortedFilterWalletsIds = computed(() => {
  const filteredIds = filter.walletsIds.value
  const showedIds = walletsStore.sortedIds.slice(0, statConfig.config.value.showedWallets)
  return [...new Set([...showedIds, ...filteredIds])]
})

function onClickWallet(walletId: WalletId) {
  filter.toggleWalletId(walletId)
  trnsFormStore.values.walletId = walletId
}

const preCategoriesIds = computed(() => [...filter.categoriesIds.value])
</script>

<template>
  <UiPage>
    <StatHeader>
      <template #title>
        <FilterSelector
          isShowCategories
          isShowWallets
        />
        <StatMenu
          :active="activeTab"
          @click="id => activeTab = id"
        />
      </template>

      <template #actions>
        <StatConfigPopover isShowWallets />
      </template>

      <template v-if="filter.isShow?.value && filter.categoriesIds.value.length > 0" #filterSelected>
        <FilterSelected
          isShowCategories
        />
      </template>
    </StatHeader>

    <div
      v-if="statConfig.config.value.showedWallets > 0 || filter.walletsIds.value.length > 0"
      class="statWalletsWrapper"
    >
      <WalletsItem
        v-for="walletId in sortedFilterWalletsIds"
        :key="walletId"
        :activeItemId="filter.walletsIds.value.includes(`${walletId}`) ? walletId : null"
        :walletId
        :wallet="walletsStore.itemsWithAmount?.[walletId]"
        alt
        @click="onClickWallet(walletId)"
      />
    </div>

    <!-- NetIncome -->
    <div
      v-if="activeTab === 'netIncome'"
      class="statWrapSummary"
    >
      <StatItem
        :storageKey
        :trnsIds="trnsIds"
        :preCategoriesIds
        hasChildren
        type="sum"
      />

      <div class="invisible max-w-sm md:visible">
        <UiToggle2
          :initStatus="true"
          class="hidden md:grid md:max-w-xl"
          openPadding="!pb-6"
          storageKey="finapp-wallets-currencies"
        >
          <template #header="{ toggle, isShown }">
            <UiTitle8
              :isShown
              @click="toggle"
            >
              {{ t('dates.selector.title') }}
            </UiTitle8>
          </template>

          <StatDateSelector
            :maxRange
          />
        </UiToggle2>
      </div>
    </div>

    <!-- Summary -->
    <div
      v-if="activeTab === 'sum'"
      class="statWrapSummary"
    >
      <StatItem
        :storageKey
        :trnsIds="expenseTrnsIds"
        :preCategoriesIds
        hasChildren
        type="expense"
      />

      <StatItem
        :storageKey
        :trnsIds="incomeTrnsIds"
        :preCategoriesIds
        hasChildren
        type="income"
      />
    </div>
  </UiPage>
</template>
