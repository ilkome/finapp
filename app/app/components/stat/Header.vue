<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { StatTabSlug } from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

import { filterKey, statConfigKey, statDateKey } from '~/components/stat/injectionKeys'
import { getTypesMapping } from '~/components/stat/utils'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  backSkipPattern?: RegExp
  backTo?: string
  configCategories?: boolean
  configWallets?: boolean
  filterCategories?: boolean
  filterWallets?: boolean
  hideTabs?: boolean
  preCategoriesIds?: CategoryId[]
  trnsIds?: TrnId[]
}>()

const activeTab = defineModel<StatTabSlug>('activeTab')

const filter = inject(filterKey)!
const statConfig = inject(statConfigKey)!
const statDate = inject(statDateKey)!
const walletsStore = useWalletsStore()
const trnsFormStore = useTrnsFormStore()
const trnsStore = useTrnsStore()

const isPopoverOpen = ref(false)

const sortedFilterWalletsIds = computed(() => {
  const filteredIds = filter.walletsIds.value
  const showedIds = statConfig.config.value.wallets.isShow
    ? walletsStore.sortedIds.slice(0, statConfig.config.value.wallets.count)
    : filteredIds
  return [...new Set([...showedIds, ...filteredIds])]
})

const categoryConfigTrnsIds = computed(() => {
  if (!props.configCategories || !props.trnsIds)
    return undefined

  return trnsStore.getStoreTrnsIds({
    dates: {
      end: statDate.range.value.end,
      start: statDate.range.value.start,
    },
    sort: true,
    trnsIds: props.trnsIds,
    trnsTypes: activeTab.value ? getTypesMapping(activeTab.value) : undefined,
  })
})

function onClickWallet(walletId: WalletId) {
  filter.toggleWalletId(walletId)
  trnsFormStore.values.walletId = walletId
}
</script>

<template>
  <UiHeader :backSkipPattern="backSkipPattern" :backTo="backTo">
    <slot name="title" />

    <template #actions>
      <div class="flex items-center">
        <StatFilterSelector
          v-if="filterCategories || filterWallets"
          :isShowCategories="!!filterCategories"
          :isShowWallets="!!filterWallets"
        />

        <StatConfigModal>
          <StatConfigView
            :isShowWallets="!!configWallets"
            :selectedTrnsIds="categoryConfigTrnsIds"
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

    <template v-if="activeTab && !props.hideTabs" #selected>
      <StatMenu
        :active="activeTab"
        @click="(id: StatTabSlug) => activeTab = id"
      />
    </template>

    <template
      v-if="statConfig.config.value.wallets.isShow"
      #after
    >
      <div class="flex overflow-x-auto px-2 py-2 lg:px-4 2xl:px-8">
        <div class="flex shrink-0 gap-2">
          <WalletsItem
            v-for="walletId in sortedFilterWalletsIds"
            :key="walletId"
            :activeItemId="filter.walletsIds.value.includes(`${walletId}`) ? walletId : null"
            :walletId
            :wallet="walletsStore.itemsComputed?.[walletId]!"
            :isShowIcon="statConfig.config.value.wallets.isShowIcon"
            insideClasses="!min-h-[38px]"
            compact
            @click="onClickWallet(walletId)"
          />
        </div>
      </div>
    </template>
  </UiHeader>
</template>
