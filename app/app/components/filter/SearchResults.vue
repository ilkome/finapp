<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { WalletId } from '~/components/wallets/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { filterKey } from '~/components/filter/injectionKeys'
import { searchCategories, searchWallets } from '~/components/filter/search'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  pendingCategories: CategoryId[]
  pendingWallets: WalletId[]
  searchQuery: string
}>()

const emit = defineEmits<{
  toggleCategory: [id: CategoryId]
  toggleWallet: [id: WalletId]
}>()

const { t } = useI18n()
const filter = inject(filterKey)!
const categoriesStore = useCategoriesStore()
const walletsStore = useWalletsStore()

const walletResults = computed<WalletId[]>(() =>
  filter.canFilterWallets ? searchWallets(props.searchQuery, walletsStore.itemsComputed) : [],
)
const categoryResults = computed<CategoryId[]>(() =>
  filter.canFilterCategories
    ? searchCategories(props.searchQuery, categoriesStore.items, categoriesStore.hasChildren)
    : [],
)
const hasNoResults = computed(() => walletResults.value.length === 0 && categoryResults.value.length === 0)
</script>

<template>
  <div class="h-full scroller-block overflow-y-auto px-3 pb-20 md:px-1">
    <div
      v-if="hasNoResults"
      class="p-4 text-center text-muted"
    >
      {{ t('search.noResults') }}
    </div>

    <template v-if="walletResults.length">
      <UiTitleModal>
        {{ t('wallets.title') }}
      </UiTitleModal>
      <div class="grid gap-1 pt-1">
        <div
          v-for="walletId in walletResults"
          :key="walletId"
          :class="cn(
            'flex items-center rounded-md border border-transparent bg-elevated/30 select-none hover:bg-elevated/50 [&_.uiElement:hover]:bg-transparent',
            props.pendingWallets.includes(walletId) && 'border-primary/40',
          )"
          @click="emit('toggleWallet', walletId)"
        >
          <WalletsItem
            :wallet="walletsStore.itemsComputed[walletId]!"
            :walletId="walletId"
            :lineWidth="4"
            class="min-w-0 flex-1"
            isShowCreditLimit
            isShowIcon
          />
        </div>
      </div>
    </template>

    <template v-if="categoryResults.length">
      <UiTitleModal>
        {{ t('categories.title') }}
      </UiTitleModal>
      <CategoriesSelectorGrid
        :ids="categoryResults"
        :selectedIds="props.pendingCategories"
        class="pt-1"
        @selected="emit('toggleCategory', $event)"
      />
    </template>
  </div>
</template>
