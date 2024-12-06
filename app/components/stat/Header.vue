<script setup lang="ts">
import type { Range } from '~/components/date/types'
import type { StatConfigProvider } from '~/components/stat/useStatConfig'
import type { FilterProvider } from '~/components/filter/types'
import type { WalletId } from '~/components/wallets/types'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import type { MoneyTypeSlugNew } from '~/components/stat/types'

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
    active: MoneyTypeSlugNew
    click: (id: MoneyTypeSlugNew) => void
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
  <div class="bg-foreground-3 sticky top-0 z-20 p-2 !pb-1 lg:px-4 xl:py-2 2xl:px-8">
    <div class="grid max-w-5xl gap-2">
      <div class="flex items-start gap-2">
        <div class="grid grow gap-2">
          <slot name="title" />
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

      <StatMenu
        v-if="props.menu"
        :active="props.menu.active"
        @click="props.menu.click"
      />
    </div>
  </div>

  <div class="px-2 pb-0 lg:px-4 2xl:px-8">
    <div
      v-if="filter.isShow?.value && filter.categoriesIds.value.length > 0"
      class="pt-2"
    >
      <FilterSelected
        :isShowCategories="props.filter.isShowCategories"
        :isShowWallets="props.filter.isShowWallets"
      />
    </div>

    <div
      v-if="statConfig.config.value.showedWallets > 0 || filter.walletsIds.value.length > 0"
      class="flex max-w-6xl gap-1 overflow-x-auto py-px pt-2 xl:pt-2"
    >
      <WalletsItem
        v-for="walletId in sortedFilterWalletsIds"
        :key="walletId"
        :activeItemId="filter.walletsIds.value.includes(`${walletId}`) ? walletId : null"
        :walletId
        :wallet="walletsStore.itemsWithAmount?.[walletId]!"
        alt
        @click="onClickWallet(walletId)"
      />
    </div>

    <slot name="summary" />

    <StatDateNavigation :maxRange="props.maxRange" />
  </div>
</template>
