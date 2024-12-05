<script setup lang="ts">
import type { StatTabs } from '~/components/app/types'
import type { Range } from '~/components/date/types'
import type { StatConfigProvider } from '~/components/stat/useStatConfig'
import type { FilterProvider } from '~/components/filter/types'
import type { WalletId } from '~/components/wallets/types'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

const props = defineProps<{
  config: {
    isShowCategories?: boolean
    isShowWallets?: boolean
  }
  filter: {
    isShow?: boolean
    isShowCategories?: boolean
    isShowSelected?: boolean
    isShowWallets?: boolean
  }
  maxRange: Range
  menu: {
    active: StatTabs
    click: (id: StatTabs) => void
  }
}>()

const filter = inject('filter') as FilterProvider
const statConfig = inject('statConfig') as StatConfigProvider
const walletsStore = useWalletsStore()
const trnsFormStore = useTrnsFormStore()

const sortedFilterWalletsIds = computed(() => {
  const filteredIds = filter.walletsIds.value
  const showedIds = walletsStore.sortedIds.slice(0, statConfig.config.value.showedWallets)
  return [...new Set([...showedIds, ...filteredIds])]
})

function onClickWallet(walletId: WalletId) {
  filter.toggleWalletId(walletId)
  trnsFormStore.values.walletId = walletId
}
</script>

<template>
  <div class="statHeaderWrapper">
    <div class="grid max-w-5xl gap-2">
      <div class="flex items-start gap-2">
        <div class="grid grow gap-2">
          <slot name="title" />
          <StatMenu
            v-if="props.menu"
            :active="props.menu.active"
            @click="props.menu.click"
          />
        </div>

        <div class="ml-auto flex items-center gap-2">
          <FilterSelector
            :isShowCategories="props.filter.isShowCategories"
            :isShowWallets="props.filter.isShowWallets"
          />
          <StatConfigPopover
            v-if="props.config"
            :isShowWallets="props.config.isShowWallets"
            :isShowCategories="props.config.isShowCategories"
          >
            <slot name="actions" />
          </StatConfigPopover>
        </div>
      </div>

      <StatDateNavigation
        :maxRange="props.maxRange"
      />
    </div>
  </div>

  <div
    v-if="filter.isShow?.value && filter.categoriesIds.value.length > 0"
    class="p-2 lg:px-4 xl:py-2 2xl:px-8"
  >
    <FilterSelected
      :isShowCategories="props.filter.isShowCategories"
      :isShowWallets="props.filter.isShowWallets"
    />
  </div>

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
</template>
