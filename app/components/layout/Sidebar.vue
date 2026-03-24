<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { WalletId } from '~/components/wallets/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useWalletContextMenu } from '~/components/wallets/useWalletContextMenu'
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

const isShowLogoMenu = ref(false)
const { getWalletContextMenuItems } = useWalletContextMenu()

type SidebarTab = 'categories' | 'wallets'
const activeTab = ref<SidebarTab>('wallets')
</script>

<template>
  <aside
    :class="{
      'md:w-72': props.isShowSidebar,
    }"
    class="fixed inset-y-0 left-0 z-40 hidden h-dvh w-12 overflow-hidden transition-all duration-300 ease-in-out sm:block"
  >
    <div class="relative h-full overflow-hidden overflow-y-auto overscroll-contain">
      <LayoutSidebarMenu
        :isShowText="false"
        :class="{ 'md:hidden': props.isShowSidebar }"
        class="sm:align-center hidden h-full flex-col justify-center gap-1 sm:flex"
      />

      <div
        v-if="props.isShowSidebar"
        class="hidden h-full content-start gap-8 overflow-hidden overflow-y-auto md:grid"
      >
        <div class="px-2 pt-5">
          <BottomSheetOrDropdown
            :isOpen="isShowLogoMenu"
            isShowCloseBtn
            @openModal="isShowLogoMenu = true"
            @closeModal="isShowLogoMenu = false"
          >
            <template #trigger>
              <div
                class="interactive group-data-[state='open']:!bg-item-4 block cursor-default rounded-sm px-3 py-2"
              >
                <UiLogo />
              </div>
            </template>

            <template #content>
              <div class="grid gap-2 px-1 py-3 md:px-3">
                <UserViewLogout isShowSignOut />

                <div class="flex items-center gap-2">
                  <LocaleSwitcher />
                  <ThemeSwitcher />
                  <ThemePicker />
                </div>
              </div>
            </template>
          </BottomSheetOrDropdown>
        </div>

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
          <template v-if="activeTab === 'categories' && categoriesStore.recentCategoriesIds.length > 0">
            <CategoriesItem
              v-for="categoryId in categoriesStore.recentCategoriesIds.slice(0, 10)"
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

      <div class="absolute bottom-0 left-0 hidden w-full flex-col gap-2 md:flex">
        <UTooltip
          :text="t('app.toggleSidebar')"
          :kbds="['Meta', '\\']"
        >
          <UiActionButton
            :ariaLabel="t('app.toggleSidebar')"
            class="text-4 z-10"
            @click="emit('toggleSidebar')"
          >
            <Icon :name="props.isShowSidebar ? 'lucide:panel-left-close' : 'lucide:panel-left'" size="18" />
          </UiActionButton>
        </UTooltip>
      </div>
    </div>
  </aside>
</template>
