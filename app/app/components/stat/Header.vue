<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { StatTabSlug } from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

import { filterKey } from '~/components/filter/injectionKeys'
import { statConfigKey } from '~/components/stat/injectionKeys'
import { getSortedFilterWalletsIds } from '~/components/stat/utils'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

// Defaults to true so pages that always have a breakdown need not pass it; an absent
// Boolean prop would cast to false and forward that to StatConfigView.
const props = withDefaults(defineProps<{
  backSkipPattern?: RegExp
  backTo?: string
  compactBottom?: boolean
  configCategories?: boolean
  configWallets?: boolean
  hasCategoryBreakdown?: boolean
  hideTabs?: boolean
  preCategoriesIds?: CategoryId[]
  sticky?: boolean
  trnsIds?: TrnId[]
}>(), {
  hasCategoryBreakdown: true,
  sticky: true,
})

const activeTab = defineModel<StatTabSlug>('activeTab')

const filter = inject(filterKey)!
const statConfig = inject(statConfigKey)!
const walletsStore = useWalletsStore()
const trnsFormStore = useTrnsFormStore()

const isPopoverOpen = ref(false)

const sortedFilterWalletsIds = computed(() => getSortedFilterWalletsIds(
  filter.walletsIds.value,
  walletsStore.sortedIds,
  statConfig.config.value.wallets.isShow,
  statConfig.config.value.wallets.count,
))

function onClickWallet(walletId: WalletId) {
  filter.toggleWalletId(walletId)
  trnsFormStore.values.walletId = walletId
}
</script>

<template>
  <UiHeader
    :backSkipPattern="backSkipPattern"
    :backTo="backTo"
    :compactBottom="props.compactBottom"
    :sticky="props.sticky"
  >
    <slot name="title" />

    <template #actions>
      <div class="flex items-center">
        <StatConfigModal>
          <StatConfigView
            :hasCategoryBreakdown
            :hasTrnsConfig="!!configCategories && trnsIds !== undefined"
            :isShowWallets="!!configWallets"
          />
        </StatConfigModal>

        <BottomSheetOrDropdown
          v-if="$slots.popover"
          :isOpen="isPopoverOpen"
          @openModal="isPopoverOpen = true"
          @closeModal="isPopoverOpen = false"
        >
          <template #trigger>
            <UTooltip :text="$t('base.moreOptions')">
              <UiActionButton :ariaLabel="$t('base.moreOptions')">
                <Icon name="lucide:ellipsis-vertical" size="20" />
              </UiActionButton>
            </UTooltip>
          </template>

          <template #content="{ close }">
            <slot name="popover" :close />
          </template>
        </BottomSheetOrDropdown>
      </div>
    </template>

    <template v-if="activeTab && !props.hideTabs && statConfig.showTabs.value" #selected>
      <StatMenu
        :active="activeTab"
        @click="(id: StatTabSlug) => activeTab = id"
      />
    </template>

    <template
      v-if="statConfig.config.value.wallets.isShow"
      #after
    >
      <div class="flex overflow-x-auto p-2 lg:px-4 2xl:px-8">
        <div class="flex shrink-0 gap-2">
          <WalletsItem
            v-for="walletId in sortedFilterWalletsIds"
            :key="walletId"
            :activeItemId="filter.walletsIds.value.includes(`${walletId}`) ? walletId : null"
            :walletId
            :wallet="walletsStore.itemsComputed?.[walletId]!"
            :isShowIcon="statConfig.config.value.wallets.isShowIcon"
            insideClasses="min-h-9.5!"
            compact
            @click="onClickWallet(walletId)"
          />
        </div>
      </div>
    </template>
  </UiHeader>
</template>
