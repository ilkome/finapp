<script setup lang="ts">
import type { Range } from '~/components/date/types'
import type { FilterProvider } from '~/components/filter/types'
import type { MoneyTypeSlugNew } from '~/components/stat/types'
import type { StatConfigProvider } from '~/components/stat/useStatConfig'
import type { WalletId } from '~/components/wallets/types'

import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  config?: {
    isShowCategories?: boolean
    isShowWallets?: boolean
  }
  filter?: {
    isShow?: boolean
    isShowCategories?: boolean
    isShowSelected?: boolean
    isShowWallets?: boolean
  }
  maxRange?: Range
  menu?: {
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
  const showedIds = statConfig.config.value.wallets.isShow
    ? walletsStore.sortedIds.slice(0, statConfig.config.value.wallets.count)
    : filteredIds
  return [...new Set([...showedIds, ...filteredIds])]
})

function onClickWallet(walletId: WalletId) {
  filter.toggleWalletId(walletId)
  trnsFormStore.values.walletId = walletId
}
</script>

<template>
  <UiHeader>
    <slot name="title" />

    <template #actions>
      <div
        v-if="props.filter || props.config"
        class="ml-auto flex items-center gap-1"
      >
        <FilterSelector
          v-if="props.filter"
          :isShowCategories="props.filter.isShowCategories"
          :isShowWallets="props.filter.isShowWallets"
        />
        <StatConfigPopover
          v-if="props.config"
          :isShowWallets="props.config.isShowWallets"
          :isShowCategories="props.config.isShowCategories"
        >
          <div v-if="$slots.popover">
            <slot name="popover" />
          </div>
        </StatConfigPopover>
      </div>
    </template>

    <template #after>
      <div
        v-if="props.menu"
        class="px-2 pt-1 lg:px-4 lg:pt-2 2xl:px-8"
      >
        <StatMenu
          :active="props.menu.active"
          @click="props.menu.click"
        />
      </div>

      <div
        v-if="filter.isShow?.value || statConfig.config.value.wallets.isShow || $slots.summary"
        class="grid gap-2 px-2 pb-0 lg:px-4 2xl:px-8"
      >
        <template v-if="filter.isShow?.value || statConfig.config.value.wallets.isShow">
          <div
            v-if="props.filter && filter.isShow?.value && filter.categoriesIds.value.length > 0 || (filter.walletsIds.value.length > 0 && !statConfig.config.value.wallets.isShow)"
          >
            <FilterSelected
              :isShowCategories="props.filter?.isShowCategories"
              :isShowWallets="props.filter?.isShowWallets && !statConfig.config.value.wallets.isShow"
            />
          </div>

          <div
            v-if="statConfig.config.value.wallets.isShow"
            class="flex max-w-6xl gap-1 overflow-x-auto py-px"
          >
            <WalletsItem
              v-for="walletId in sortedFilterWalletsIds"
              :key="walletId"
              :activeItemId="filter.walletsIds.value.includes(`${walletId}`) ? walletId : null"
              :walletId
              :wallet="walletsStore.itemsWithAmount?.[walletId]!"
              insideClasses="!min-h-[38px]"
              alt
              @click="onClickWallet(walletId)"
            />
          </div>
        </template>

        <slot name="summary" />
      </div>
    </template>
  </UiHeader>
</template>
