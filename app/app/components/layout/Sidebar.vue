<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

import type { WalletId } from '~/components/wallets/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { SIDEBAR_COLLAPSE_WIDTH, SIDEBAR_DEFAULT_WIDTH, SIDEBAR_MAX_WIDTH, SIDEBAR_MIN_WIDTH } from '~/components/layout/sidebarWidth'
import { useWalletMenuItems } from '~/components/wallets/useWalletMenuItems'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  isHidden?: boolean
  isShowSidebar?: boolean
  width: number
}>()

const emit = defineEmits<{
  'toggleSidebar': []
  'update:width': [width: number]
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

const isResizing = ref(false)

function startResize(event: PointerEvent) {
  event.preventDefault()
  isResizing.value = true
  const startWidth = props.width
  // Tracked locally: the prop only catches up after the parent re-renders, mid-drag.
  let isExpanded = !!props.isShowSidebar
  function stop() {
    isResizing.value = false
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', stop)
  }
  function onMove(e: PointerEvent) {
    const isPastCollapse = e.clientX < SIDEBAR_COLLAPSE_WIDTH
    if (isExpanded && isPastCollapse) {
      stop()
      // Collapsing keeps the last chosen width for the next expand.
      emit('update:width', startWidth)
      emit('toggleSidebar')
      return
    }
    if (!isExpanded) {
      if (isPastCollapse)
        return
      isExpanded = true
      emit('toggleSidebar')
    }
    emit('update:width', Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, Math.round(e.clientX))))
  }
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', stop)
}
</script>

<template>
  <aside
    :class="{
      'md:-translate-x-full': props.isHidden,
      'md:w-(--sidebar-width)': props.isShowSidebar,
      'transition-all duration-300 ease-in-out': !isResizing,
    }"
    class="fixed inset-y-0 left-0 z-40 hidden h-dvh w-12 overflow-hidden md:block"
  >
    <div class="relative flex h-full flex-col overflow-hidden">
      <div
        :class="props.isShowSidebar && 'px-2'"
        class="flex shrink-0 items-center gap-1 pt-4"
      >
        <div v-if="props.isShowSidebar" class="grow px-3 py-2">
          <UiLogo />
        </div>

        <UTooltip
          :text="t('app.toggleSidebar')"
          :kbds="['Meta', '\\']"
        >
          <button
            type="button"
            :aria-label="t('app.toggleSidebar')"
            class="flex h-12 shrink-0 items-center rounded-md interactive px-2 text-muted"
            @click="emit('toggleSidebar')"
          >
            <span class="flex min-w-8 items-center justify-center">
              <Icon :name="props.isShowSidebar ? 'lucide:panel-left-close' : 'lucide:panel-left'" size="18" />
            </span>
          </button>
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

      <div
        :class="props.isShowSidebar ? 'px-2 pb-2' : 'px-0 pb-4'"
        class="pointer-events-none absolute inset-x-0 bottom-0 z-10 pt-1"
      >
        <LayoutSidebarUserMenu :collapsed="!props.isShowSidebar" />
      </div>

      <div
        class="absolute inset-y-0 right-0 z-20 w-1.5 cursor-col-resize hover:bg-elevated/50"
        :class="isResizing && 'bg-elevated/50'"
        @pointerdown="startResize"
        @dblclick="emit('update:width', SIDEBAR_DEFAULT_WIDTH)"
      />
    </div>
  </aside>
</template>
