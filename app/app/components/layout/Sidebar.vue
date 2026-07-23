<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { WalletId } from '~/components/wallets/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { compareCategoryIds } from '~/components/categories/utils'
import { useWalletMenuItems } from '~/components/wallets/useWalletMenuItems'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  isShowSidebar?: boolean
}>()

const emit = defineEmits<{
  toggleSidebar: []
}>()

const route = useRoute()
const { t } = useI18n()
const walletsStore = useWalletsStore()
const categoriesStore = useCategoriesStore()

const walletMenu = useWalletMenuItems()

function getWalletContextMenuItems(walletId: WalletId) {
  return [
    [walletMenu.edit(walletId)],
  ]
}

type SidebarTab = 'categories' | 'wallets'
const activeTab = ref<SidebarTab>('wallets')

const sidebarCategoryIds = computed(() => {
  const seen = new Set<CategoryId>()
  const ids: CategoryId[] = []

  for (const id of categoriesStore.favoriteCategoriesIds) {
    if (!seen.has(id)) {
      seen.add(id)
      ids.push(id)
    }
  }

  const remainingSlots = Math.max(0, 10 - ids.length)
  let added = 0
  for (const id of categoriesStore.recentCategoriesIds) {
    if (added >= remainingSlots)
      break
    if (!seen.has(id)) {
      seen.add(id)
      ids.push(id)
      added++
    }
  }

  return ids.sort((a, b) => compareCategoryIds(a, b, categoriesStore.items))
})
</script>

<template>
  <aside
    :class="{ 'md:w-72': props.isShowSidebar }"
    class="fixed inset-y-0 left-0 z-40 hidden h-dvh w-12 overflow-hidden bg-elevated/25 transition-all duration-300 ease-in-out md:block"
  >
    <div class="flex h-full flex-col overflow-hidden">
      <div
        :class="props.isShowSidebar ? 'px-2 pt-5' : 'justify-center px-1 pt-3'"
        class="flex shrink-0 items-center gap-1"
      >
        <div v-if="props.isShowSidebar" class="grow px-3 py-2">
          <UiLogo />
        </div>

        <UTooltip
          :text="t('app.toggleSidebar')"
          :kbds="['Meta', '\\']"
        >
          <UiActionButton
            :ariaLabel="t('app.toggleSidebar')"
            class="shrink-0 text-muted"
            @click="emit('toggleSidebar')"
          >
            <Icon :name="props.isShowSidebar ? 'lucide:panel-left-close' : 'lucide:panel-left'" size="18" />
          </UiActionButton>
        </UTooltip>
      </div>

      <div class="min-h-0 grow overflow-y-auto overscroll-contain">
        <LayoutSidebarMenu
          v-if="!props.isShowSidebar"
          :isShowText="false"
          class="flex min-h-full flex-col items-center justify-center gap-1"
        />

        <div
          v-else
          class="grid content-start gap-8 pt-3"
        >
          <LayoutSidebarMenu class="px-2 pb-2" />

          <div class="px-2 pb-6">
            <div class="flex gap-1 pb-2 pl-1">
              <UiTabsItemPill
                variant="outline"
                :isActive="activeTab === 'wallets'"
                @click="activeTab = 'wallets'"
              >
                {{ t('wallets.name') }}
              </UiTabsItemPill>
              <UiTabsItemPill
                variant="outline"
                :isActive="activeTab === 'categories'"
                @click="activeTab = 'categories'"
              >
                {{ t('categories.name') }}
              </UiTabsItemPill>
            </div>

            <!-- Wallets -->
            <template v-if="activeTab === 'wallets' && walletsStore.recentWalletIds.length > 0">
              <WalletsItem
                v-for="walletId in walletsStore.recentWalletIds.slice(0, 10)"
                :key="walletId"
                :activeItemId="(route.params.id as string)"
                :contextMenuItems="getWalletContextMenuItems(walletId as WalletId)"
                :lineWidth="1"
                :wallet="walletsStore.itemsComputed[walletId]!"
                :walletId
                class="group"
                isShowCreditLimit
                isShowRate
                isShowIcon
                :to="walletId === route.params.id ? '/dashboard' : `/wallets/${walletId}`"
              />
            </template>

            <!-- Categories -->
            <template v-if="activeTab === 'categories' && sidebarCategoryIds.length > 0">
              <CategoriesItem
                v-for="categoryId in sidebarCategoryIds"
                :key="categoryId"
                :activeItemId="(route.params.id as string)"
                :categoryId="(categoryId as CategoryId)"
                :category="categoriesStore.items[categoryId]!"
                :lineWidth="1"
                isShowParent
                stacked
                :to="categoryId === route.params.id ? '/dashboard' : `/categories/${categoryId}`"
              />
            </template>
          </div>
        </div>
      </div>

      <div class="shrink-0 px-2 pt-1 pb-2">
        <LayoutSidebarUserMenu :collapsed="!props.isShowSidebar" />
      </div>
    </div>
  </aside>
</template>
