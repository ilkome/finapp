<script setup lang="ts">
import type { StatTabSlug } from '~/components/stat/types'
import type { WalletId } from '~/components/wallets/types'

import { filterKey, statConfigKey } from '~/components/stat/injectionKeys'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

defineProps<{
  backTo?: string
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
  <UiHeader :backTo="backTo">
    <slot name="title" />

    <template #actions>
      <div class="hidden items-center sm:flex">
        <StatFilterSelector
          v-if="filterCategories || filterWallets"
          :isShowCategories="!!filterCategories"
          :isShowWallets="!!filterWallets"
        />

        <StatConfigModal
          :isShowWallets="!!configWallets"
        />
      </div>

      <BottomSheetOrDropdown
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

        <template #content="{ close: closeContent }">
          <div class="min-w-52 p-1 pt-4 pb-3">
            <!-- Mobile: search, filters, config -->
            <div class="mb-2 grid border-b border-(--ui-border) pb-3 sm:hidden">
              <StatFilterSelector
                v-if="filterCategories || filterWallets"
                :isShowCategories="!!filterCategories"
                :isShowWallets="!!filterWallets"
                :onBeforeOpen="() => { closeContent?.(); isPopoverOpen = false }"
                labelMode
              />

              <StatConfigModal
                :isShowWallets="!!configWallets"
                :onBeforeOpen="() => { closeContent?.(); isPopoverOpen = false }"
                labelMode
              />
            </div>

            <slot
              name="popover"
              :close="() => { closeContent?.(); isPopoverOpen = false }"
            />
          </div>
        </template>
      </BottomSheetOrDropdown>
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
            compact
            @click="onClickWallet(walletId)"
          />
        </div>
      </div>
    </template>
  </UiHeader>
</template>
