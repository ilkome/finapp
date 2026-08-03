<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

import type { WalletId } from '~/components/wallets/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
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

const sidebarWalletIds = computed(() => walletsStore.recentWalletIds.slice(0, 10))

const tabItems = computed<TabsItem[]>(() => [
  { label: t('wallets.name'), value: 'wallets' },
  { label: t('categories.name'), value: 'categories' },
])
</script>

<template>
  <aside
    :class="{ 'md:w-72': props.isShowSidebar }"
    class="fixed inset-y-0 left-0 z-40 hidden h-dvh w-12 overflow-hidden bg-elevated/25 transition-all duration-300 ease-in-out md:block"
  >
    <div class="relative flex h-full flex-col overflow-hidden">
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
          class="grid content-start gap-8 pt-3 pb-16"
        >
          <LayoutSidebarMenu class="px-2 pb-2" />

          <div class="px-2 pb-6">
            <div class="pb-2 pl-1">
              <UiTabs
                v-model="activeTab"
                size="xs"
                :items="tabItems"
              />
            </div>

            <!-- Wallets -->
            <template v-if="activeTab === 'wallets' && sidebarWalletIds.length > 0">
              <WalletsItem
                v-for="(walletId, index) in sidebarWalletIds"
                :key="walletId"
                :activeItemId="(route.params.id as string)"
                :contextMenuItems="getWalletContextMenuItems(walletId as WalletId)"
                :lineWidth="index === sidebarWalletIds.length - 1 ? 0 : 1"
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
            <template v-if="activeTab === 'categories' && categoriesStore.sidebarCategoryIds.length > 0">
              <CategoriesItem
                v-for="(categoryId, index) in categoriesStore.sidebarCategoryIds"
                :key="categoryId"
                :activeItemId="(route.params.id as string)"
                :categoryId
                :category="categoriesStore.items[categoryId]!"
                :lineWidth="index === categoriesStore.sidebarCategoryIds.length - 1 ? 0 : 1"
                isShowParent
                stacked
                :to="categoryId === route.params.id ? '/dashboard' : `/categories/${categoryId}`"
              />
            </template>
          </div>
        </div>
      </div>

      <div class="pointer-events-none absolute right-0 bottom-0 left-0 z-10 px-2 pt-1 pb-2">
        <LayoutSidebarUserMenu :collapsed="!props.isShowSidebar" />
      </div>
    </div>
  </aside>
</template>
