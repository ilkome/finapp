<script setup lang="ts">
import Swiper from 'swiper'

import type { CategoryId } from '~/components/categories/types'
import type { WalletId } from '~/components/wallets/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { filterKey } from '~/components/stat/injectionKeys'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

import 'swiper/css'

const props = defineProps<{
  isExpanded?: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const { t } = useI18n()
const filter = inject(filterKey)!
const categoriesStore = useCategoriesStore()
const walletsStore = useWalletsStore()

const search = ref('')
const searchQuery = computed(() => search.value.trim().toLowerCase())

// Staged selection: mutated locally, written to the URL only on Apply.
const pendingWallets = ref<WalletId[]>([...filter.walletsIds.value])
const pendingCategories = ref<CategoryId[]>([...filter.categoriesIds.value])

const hasPending = computed(() =>
  pendingWallets.value.length > 0 || pendingCategories.value.length > 0,
)
// Reset stays reachable while any applied filter exists, so an emptied pending
// (which disables Apply) can never trap the user with a stale active filter.
const showReset = computed(() => hasPending.value || filter.isShow.value)

function toggleWallet(id: WalletId) {
  pendingWallets.value = pendingWallets.value.includes(id)
    ? pendingWallets.value.filter(x => x !== id)
    : [...pendingWallets.value, id]
}

function toggleCategory(id: CategoryId) {
  pendingCategories.value = pendingCategories.value.includes(id)
    ? pendingCategories.value.filter(x => x !== id)
    : [...pendingCategories.value, id]
}

function addCategories(ids: CategoryId[]) {
  pendingCategories.value = [...new Set([...pendingCategories.value, ...ids])]
}

function removeCategories(ids: CategoryId[]) {
  const set = new Set(ids)
  pendingCategories.value = pendingCategories.value.filter(x => !set.has(x))
}

function apply() {
  filter.applyFilter(pendingWallets.value, pendingCategories.value)
  emit('close')
}

function reset() {
  search.value = ''
  pendingWallets.value = []
  pendingCategories.value = []
  filter.applyFilter([], [])
}

const walletResults = computed<WalletId[]>(() => {
  const q = searchQuery.value
  if (!q)
    return []
  return Object.keys(walletsStore.itemsComputed).filter((id) => {
    const wallet = walletsStore.itemsComputed[id]
    return wallet && !wallet.isArchived && wallet.name.toLowerCase().includes(q)
  })
})

const categoryResults = computed<CategoryId[]>(() => {
  const q = searchQuery.value
  if (!q)
    return []
  const items = categoriesStore.items
  const ids: CategoryId[] = []
  for (const id in items) {
    const cat = items[id]
    if (!cat || id === 'transfer' || id === 'adjustment' || categoriesStore.hasChildren(id))
      continue
    const parent = items[cat.parentId]
    if (cat.name.toLowerCase().includes(q) || parent?.name.toLowerCase().includes(q))
      ids.push(id)
  }
  return ids.sort((a, b) => (items[a]?.name ?? '').localeCompare(items[b]?.name ?? ''))
})

const hasNoResults = computed(() =>
  !!searchQuery.value && walletResults.value.length === 0 && categoryResults.value.length === 0,
)

const activeTabIdx = ref(0)
const sliderRef = ref<HTMLElement | null>(null)
// shallowRef, not ref: a plain ref deep-reactive-proxies the Swiper instance,
// which corrupts its internal DOM/state so slideTo() (tab clicks) stops working.
const sliderObj = shallowRef<Swiper | null>(null)

function goToTab(idx: number) {
  activeTabIdx.value = idx
  sliderObj.value?.slideTo(idx)
}

onMounted(async () => {
  await nextTick()
  sliderObj.value = new Swiper(sliderRef.value!, {
    initialSlide: 0,
    longSwipesMs: 60,
    longSwipesRatio: 0.1,
    on: {
      slideChange: sw => activeTabIdx.value = sw.activeIndex,
    },
    shortSwipes: false,
    slidesPerView: 1,
  })
  // No `observer`/`observeParents`: the bottom sheet mutates the `transform` of
  // an ancestor `.drag` on every open/drag frame, which a Swiper observer would
  // answer with an update() each frame - janky slide switches plus disrupted
  // in-sheet scrolling. Recalc once after the open animation settles instead.
  requestAnimationFrame(() => sliderObj.value?.update())
})

// Swiper measures 0 while hidden behind search results; refresh on return.
watch(searchQuery, async (q) => {
  if (!q) {
    await nextTick()
    sliderObj.value?.update()
  }
})

onBeforeUnmount(() => sliderObj.value?.destroy(true, true))
</script>

<template>
  <div
    class="grid w-full min-w-0 grid-rows-[auto_1fr_auto] overflow-hidden"
    :class="[
      props.isExpanded === undefined ? 'max-h-[85dvh] min-h-[50dvh]' : 'relative h-full [&_.scrollerBlock]:pb-24',
      { '[&_.scrollerBlock]:touch-none [&_.scrollerBlock]:overflow-hidden': props.isExpanded === false },
    ]"
  >
    <div class="flex items-center gap-2 px-3 py-2">
      <input
        v-model="search"
        type="text"
        :aria-label="t('base.search')"
        class="bg-elevated/30 placeholder:text-muted hover:bg-elevated/50 focus:border-primary focus:bg-elevated/50 m-0 min-h-10.5 w-0 min-w-0 flex-1 rounded-md border border-transparent px-4 py-2 text-base font-normal outline-none"
        :placeholder="t('base.search')"
      >
      <UiActionButton
        v-if="showReset"
        :ariaLabel="t('base.reset')"
        @click="reset"
      >
        <Icon name="lucide:filter-x" size="20" />
      </UiActionButton>
    </div>

    <div class="min-h-0 min-w-0">
      <!-- Tabs + swipeable slider -->
      <div
        v-show="!searchQuery"
        class="grid h-full min-h-0 grid-rows-[auto_1fr]"
      >
        <div class="px-3 pb-2">
          <UiTabsBar>
            <UiTabsItemPill
              :isActive="activeTabIdx === 0"
              @click="goToTab(0)"
            >
              {{ t('wallets.title') }}
            </UiTabsItemPill>
            <UiTabsItemPill
              :isActive="activeTabIdx === 1"
              @click="goToTab(1)"
            >
              {{ t('categories.title') }}
            </UiTabsItemPill>
          </UiTabsBar>
        </div>

        <div
          ref="sliderRef"
          class="swiper h-full min-h-0 w-full min-w-0 overflow-hidden"
        >
          <div class="swiper-wrapper">
            <div class="swiper-slide h-full w-full">
              <StatFilterPanelWalletsTab
                :filterAtTop="props.isExpanded !== undefined"
                :selectedIds="pendingWallets"
                @selected="toggleWallet"
              />
            </div>
            <div class="swiper-slide h-full w-full">
              <StatFilterPanelCategoriesTab
                :selectedIds="pendingCategories"
                @removeCategories="removeCategories"
                @selected="toggleCategory"
                @setCategories="addCategories"
              />
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="searchQuery"
        class="scrollerBlock h-full overflow-y-auto px-2 pb-2"
      >
        <div
          v-if="hasNoResults"
          class="text-muted p-4 text-center"
        >
          {{ t('search.noResults') }}
        </div>

        <template v-if="walletResults.length">
          <UiTitleModal>
            {{ t('wallets.title') }}
          </UiTitleModal>
          <div
            v-for="walletId in walletResults"
            :key="walletId"
            class="hover:bg-elevated/50 flex items-center rounded-sm select-none [&_.uiElement:hover]:bg-transparent"
            @click="toggleWallet(walletId)"
          >
            <div
              class="flex-center relative w-10 shrink-0 self-stretch pl-2"
              @click.stop
            >
              <div
                class="absolute inset-0 z-10"
                @click.stop="toggleWallet(walletId)"
              />
              <UCheckbox
                :modelValue="pendingWallets.includes(walletId)"
                class="pointer-events-none"
              />
            </div>
            <WalletsItem
              :wallet="walletsStore.itemsComputed[walletId]!"
              :walletId="walletId"
              :lineWidth="4"
              class="min-w-0 flex-1"
              isShowCreditLimit
              isShowIcon
            />
          </div>
        </template>

        <template v-if="categoryResults.length">
          <UiTitleModal>
            {{ t('categories.title') }}
          </UiTitleModal>
          <CategoriesSelectorGrid
            :ids="categoryResults"
            :selectedIds="pendingCategories"
            class="px-1 pt-1"
            @selected="toggleCategory"
          />
        </template>
      </div>
    </div>

    <div
      class="px-3 py-2"
      :class="props.isExpanded !== undefined && 'absolute inset-x-0 bottom-0 z-10'"
      :style="props.isExpanded !== undefined
        ? { transform: 'translateY(calc(-1 * var(--sheet-ty, 0px)))' }
        : undefined"
    >
      <div
        v-if="props.isExpanded !== undefined"
        class="pointer-events-none absolute inset-0 -z-10"
        style="background: linear-gradient(to bottom, transparent, var(--ui-bg))"
      />
      <UiButtonAccent
        :disabled="!hasPending"
        rounded
        size="xl"
        @click="apply"
      >
        {{ t('base.apply') }}
      </UiButtonAccent>
    </div>
  </div>
</template>
