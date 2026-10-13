<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { WalletId } from '~/components/wallets/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  categoryId?: CategoryId
  drawerStyle?: Record<string, string>
  walletId?: WalletId
}>()

const emit = defineEmits<{
  selectCategory: [id: CategoryId]
  selectWallet: [id: WalletId]
}>()

const walletsStore = useWalletsStore()
const categoriesStore = useCategoriesStore()

const isShow = ref(false)
// A single sheet with a wallet/category slider replaces the two separate pickers - the tapped
// box only decides which slide it opens on. The click handler that sets this runs before the
// wrapping trigger's own click (event bubbling), so the sheet always mounts on the right slide.
const initialSlide = ref<'category' | 'wallet'>('wallet')
</script>

<template>
  <DrawerOrDropdown
    v-model:open="isShow"
    :drawerStyle="props.drawerStyle"
  >
    <template #trigger>
      <div class="grid grid-cols-2 gap-2">
        <div
          v-if="props.walletId"
          class="min-w-0"
          @click="initialSlide = 'wallet'"
        >
          <WalletsItem
            :walletId="props.walletId"
            :wallet="walletsStore.itemsComputed[props.walletId]!"
            insideClasses="min-h-11.5!"
            isShowIcon
            isShowCreditLimit
            compact
          />
        </div>

        <div
          v-if="props.categoryId"
          class="min-w-0"
          @click="initialSlide = 'category'"
        >
          <CategoriesItem
            :category="categoriesStore.items[props.categoryId]!"
            :categoryId="props.categoryId"
            stacked
            isShowParent
            insideClasses="bg-elevated/30 hover:bg-elevated/50 min-h-10.5 py-2"
          />
        </div>
      </div>
    </template>

    <template #custom="{ close }">
      <FilterPanel
        :activeCategoryId="props.categoryId"
        :activeWalletId="props.walletId"
        :initialSlide
        mode="select"
        @close="close"
        @selectCategory="emit('selectCategory', $event)"
        @selectWallet="emit('selectWallet', $event)"
      />
    </template>
  </DrawerOrDropdown>
</template>
