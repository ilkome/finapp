<script setup lang="ts">
import type { CategoryId, CategoryItem } from '~/components/categories/types'
import type { WalletId, WalletItemComputed } from '~/components/wallets/types'

const props = defineProps<{
  /** Leaf categories only: search never returns a parent. */
  categories: { category: CategoryItem, categoryId: CategoryId, parentCategory?: CategoryItem }[]
  pendingCategories: CategoryId[]
  pendingWallets: WalletId[]
  wallets: { wallet: WalletItemComputed, walletId: WalletId }[]
}>()

const emit = defineEmits<{
  toggleCategory: [id: CategoryId]
  toggleWallet: [id: WalletId]
}>()

const { t } = useI18n()
const hasNoResults = computed(() => props.wallets.length === 0 && props.categories.length === 0)
</script>

<template>
  <div class="h-full scroller-block overflow-y-auto px-3 pb-20 md:px-1">
    <div
      v-if="hasNoResults"
      class="p-4 text-center text-muted"
    >
      {{ t('search.noResults') }}
    </div>

    <template v-if="props.wallets.length">
      <UiTitleModal>
        {{ t('wallets.title') }}
      </UiTitleModal>
      <div class="grid gap-1 pt-1">
        <div
          v-for="{ wallet, walletId } in props.wallets"
          :key="walletId"
          :class="cn(
            'flex items-center rounded-md border border-transparent bg-elevated/30 select-none hover:bg-elevated/50 [&_.uiElement:hover]:bg-transparent',
            props.pendingWallets.includes(walletId) && 'border-primary/40',
          )"
          @click="emit('toggleWallet', walletId)"
        >
          <WalletsItem
            :wallet="wallet"
            :walletId="walletId"
            :lineWidth="4"
            class="min-w-0 flex-1"
            isShowCreditLimit
            isShowIcon
          />
        </div>
      </div>
    </template>

    <template v-if="props.categories.length">
      <UiTitleModal>
        {{ t('categories.title') }}
      </UiTitleModal>
      <div class="grid gap-1 pt-1 3sm:grid-cols-2">
        <CategoriesItemView
          v-for="{ category, categoryId, parentCategory } in props.categories"
          :key="categoryId"
          :category="category"
          :categoryId="categoryId"
          :parentCategory="parentCategory"
          :selectedIds="props.pendingCategories"
          class="rounded-md bg-elevated/30"
          isShowParent
          stacked
          @click="emit('toggleCategory', categoryId)"
        />
      </div>
    </template>
  </div>
</template>
