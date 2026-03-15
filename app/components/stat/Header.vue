<script setup lang="ts">
import type { StatTabSlug } from '~/components/stat/types'
import type { WalletId } from '~/components/wallets/types'

import { filterKey, statConfigKey } from '~/components/stat/injectionKeys'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

defineProps<{
  configWallets?: boolean
  filterCategories?: boolean
  filterWallets?: boolean
}>()

const activeTab = defineModel<StatTabSlug>('activeTab')

const filter = inject(filterKey)!
const statConfig = inject(statConfigKey)!
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

const isPopoverOpen = ref(false)
</script>

<template>
  <UiHeader>
    <slot name="title" />

    <template #actions>
      <div class="ml-auto flex items-center gap-1">
        <StatFilterSelector
          v-if="filterCategories || filterWallets"
          :isShowCategories="!!filterCategories"
          :isShowWallets="!!filterWallets"
        />

        <StatConfigModal
          :isShowWallets="!!configWallets"
        />

        <BottomSheetOrDropdown
          v-if="$slots.popover"
          :isOpen="isPopoverOpen"
          isShowCloseBtn
          @openModal="isPopoverOpen = true"
          @closeModal="isPopoverOpen = false"
        >
          <template #trigger>
            <UiActionButton :ariaLabel="$t('base.moreOptions')">
              <Icon name="lucide:ellipsis-vertical" size="20" />
            </UiActionButton>
          </template>

          <template #content>
            <div class="min-w-52 p-1 pt-4 pb-3">
              <slot
                name="popover"
                :close="() => isPopoverOpen = false"
              />
            </div>
          </template>
        </BottomSheetOrDropdown>
      </div>
    </template>

    <template v-if="activeTab" #selected>
      <StatMenu
        :active="activeTab"
        @click="(id: StatTabSlug) => activeTab = id"
      />
    </template>

    <template
      v-if="statConfig.config.value.wallets.isShow"
      #after
    >
      <div class="grid gap-2 px-2 pb-0 lg:px-4 2xl:px-8">
        <div class="flex max-w-6xl gap-1 overflow-x-auto py-px">
          <WalletsItem
            v-for="walletId in sortedFilterWalletsIds"
            :key="walletId"
            :activeItemId="filter.walletsIds.value.includes(`${walletId}`) ? walletId : null"
            :walletId
            :wallet="walletsStore.itemsComputed?.[walletId]!"
            insideClasses="!min-h-[38px]"
            alt
            @click="onClickWallet(walletId)"
          />
        </div>
      </div>
    </template>
  </UiHeader>
</template>
