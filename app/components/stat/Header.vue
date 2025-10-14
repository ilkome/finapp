<script setup lang="ts">
import type { FilterProvider } from '~/components/filter/types'
import type { StatConfigModal, StatTabSlug } from '~/components/stat/types'
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
  menu?: {
    active: StatTabSlug
    click: (id: StatTabSlug) => void
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

const statConfigModal: Ref<StatConfigModal> = ref({
  close: () => statConfigModal.value.isShow = false,
  isShow: false,
  show: () => statConfigModal.value.isShow = true,
})
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
          :isShowCategories="!!props.filter.isShowCategories"
          :isShowWallets="!!props.filter.isShowWallets"
        />

        <StatConfigModal
          v-if="props.config"
          :isShowCategories="!!props.config.isShowCategories"
          :isShowWallets="!!props.config.isShowWallets"
          :statConfigModal
        >
          <template
            v-if="$slots.popover"
            #default="{ close }"
          >
            <div>
              <slot
                name="popover"
                :close="() => {
                  statConfigModal.close()
                  close()
                }"
              />
            </div>
          </template>
        </StatConfigModal>
      </div>
    </template>

    <template #selected>
      <slot
        v-if="$slots.selected"
        name="selected"
      />
    </template>

    <template
      v-if="statConfig.config.value.wallets.isShow || $slots.summary"
      #after
    >
      <div class="grid gap-2 px-2 pb-0 lg:px-4 2xl:px-8">
        <template v-if="statConfig.config.value.wallets.isShow">
          <div
            v-if="statConfig.config.value.wallets.isShow"
            class="flex max-w-6xl gap-1 overflow-x-auto py-px"
          >
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
        </template>
      </div>
    </template>
  </UiHeader>
</template>
