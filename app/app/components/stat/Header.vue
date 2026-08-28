<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'

import type { CategoryId } from '~/components/categories/types'
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
  preCategoriesIds?: CategoryId[]
  sticky?: boolean
  trnsIds?: TrnId[]
}>(), {
  hasCategoryBreakdown: true,
  sticky: true,
})

const filter = inject(filterKey)!
const statConfig = inject(statConfigKey)!
const walletsStore = useWalletsStore()
const trnsFormStore = useTrnsFormStore()

const isPopoverOpen = ref(false)

type UiHeaderInstance = ComponentPublicInstance & {
  mainElement: HTMLElement | null
  rootElement: HTMLElement | null
}

const uiHeader = useTemplateRef<UiHeaderInstance>('uiHeader')
const stickyMainElement = computed(() => uiHeader.value?.mainElement)
const stickyRootElement = computed(() => uiHeader.value?.rootElement)

defineExpose({ stickyMainElement, stickyRootElement })

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
    ref="uiHeader"
    :backSkipPattern="backSkipPattern"
    :backTo="backTo"
    :compactBottom="props.compactBottom"
    :mobileAfterScrolls="!!props.configWallets && statConfig.config.value.wallets.isShow"
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

    <template
      v-if="statConfig.config.value.wallets.isShow"
      #after
    >
      <div class="stat-wallets-scroll flex snap-x snap-mandatory scroll-px-2 overflow-x-auto p-2 lg:scroll-px-4 lg:px-4 2xl:scroll-px-8 2xl:px-8">
        <div class="flex shrink-0 gap-2">
          <WalletsItem
            v-for="walletId in sortedFilterWalletsIds"
            :key="walletId"
            :activeItemId="filter.walletsIds.value.includes(`${walletId}`) ? walletId : null"
            :walletId
            :wallet="walletsStore.itemsComputed?.[walletId]!"
            :isShowIcon="statConfig.config.value.wallets.isShowIcon"
            bodyClass="snap-start snap-always"
            insideClasses="min-h-9.5!"
            compact
            @click="onClickWallet(walletId)"
          />
        </div>
      </div>
    </template>
  </UiHeader>
</template>

<style scoped>
.stat-wallets-scroll {
  scrollbar-width: none;
}

.stat-wallets-scroll::-webkit-scrollbar {
  display: none;
}
</style>
