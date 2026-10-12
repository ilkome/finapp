<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { FilterProvider } from '~/components/filter/types'
import type { WalletId } from '~/components/wallets/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { defaultFilterExtras } from '~/components/filter/extras'
import { filterKey } from '~/components/filter/injectionKeys'
import { useSidebarCategoryIds, useSidebarListsVisibility, useSidebarWalletIds } from '~/components/layout/useSidebarLists'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  kind: 'category' | 'wallet'
}>()

const { t } = useI18n()
const walletsStore = useWalletsStore()
const categoriesStore = useCategoriesStore()
const storedWalletIds = useSidebarWalletIds()
const storedCategoryIds = useSidebarCategoryIds()
const isWallet = props.kind === 'wallet'
const isShown = useSidebarListsVisibility()[isWallet ? 'wallets' : 'categories']
const currenciesStore = useCurrenciesStore()

// Ids of deleted items stay in storage until the next apply; they are never shown.
const walletsIds = computed(() => storedWalletIds.value.filter(id => !!walletsStore.items?.[id]))
const categoriesIds = computed(() => storedCategoryIds.value.filter(id => !!categoriesStore.items[id]))

// The filter panel reads only this subset; the rest of FilterProvider belongs to the URL filter.
const provider = {
  applyFilter: (next: { categories: CategoryId[], wallets: WalletId[] }) => {
    if (isWallet)
      storedWalletIds.value = next.wallets
    else
      storedCategoryIds.value = next.categories
  },
  canFilterCategories: !isWallet,
  canFilterWallets: isWallet,
  categoriesIds: computed(() => isWallet ? [] : categoriesIds.value),
  extras: computed(() => defaultFilterExtras),
  isShow: computed(() => (isWallet ? walletsIds.value : categoriesIds.value).length > 0),
  walletsIds: computed(() => isWallet ? walletsIds.value : []),
} as unknown as FilterProvider
provide(filterKey, provider)

const pickedIds = computed<string[]>(() => isWallet ? walletsIds.value : categoriesIds.value)
const count = computed(() => pickedIds.value.length)

function saveOrder(ids: string[]) {
  if (isWallet)
    storedWalletIds.value = ids as WalletId[]
  else
    storedCategoryIds.value = ids as CategoryId[]
}
const isOpen = ref(false)
const isSortOpen = ref(false)
</script>

<template>
  <UiSettingsCard :title="t(isWallet ? 'wallets.name' : 'categories.name')">
    <div class="grid gap-2">
      <UiSwitchItem
        :checkboxValue="isShown"
        :title="t('settings.sidebar.show')"
        trailing
        @toggle="isShown = !isShown"
      />

      <template v-if="isShown">
        <div class="flex items-center gap-2">
          <DrawerOrDropdown
            v-model:open="isOpen"
            class="justify-self-start"
            popoverBodyClass="py-0! md:pb-0!"
            :collapsedSnap="500"
          >
            <template #trigger="{ isActive }">
              <UiTitleDropdown :isActive>
                <span class="text-nowrap">
                  {{ count ? t('settings.sidebar.selected', { count }) : t('settings.sidebar.auto') }}
                </span>
              </UiTitleDropdown>
            </template>

            <template #custom="{ close }">
              <FilterPanel hideMore :title="t('settings.sidebar.title')" @close="close" />
            </template>
          </DrawerOrDropdown>

          <UTooltip v-if="count > 1" :text="t('base.sort')">
            <UiActionButton :ariaLabel="t('base.sort')" @click="isSortOpen = true">
              <Icon name="lucide:arrow-down-up" size="20" />
            </UiActionButton>
          </UTooltip>
        </div>

        <BottomSheetOrModal
          v-if="isSortOpen"
          :title="t('base.sort')"
          @closed="isSortOpen = false"
        >
          <WalletsSortableList
            :ids="pickedIds"
            class="grid gap-1"
            @update="saveOrder"
          >
            <template #default="{ id }">
              <div class="flex items-center gap-1">
                <WalletsSortHandle />
                <WalletsItem
                  v-if="isWallet"
                  :baseCurrencyCode="currenciesStore.base"
                  class="grow"
                  isShowIcon
                  :wallet="walletsStore.itemsComputed[id as WalletId]!"
                  :walletId="id as WalletId"
                />
                <CategoriesItem
                  v-else
                  :category="categoriesStore.items[id as CategoryId]!"
                  :categoryId="id as CategoryId"
                  class="grow"
                  isShowParent
                  stacked
                />
              </div>
            </template>
          </WalletsSortableList>
        </BottomSheetOrModal>
      </template>
    </div>
  </UiSettingsCard>
</template>
