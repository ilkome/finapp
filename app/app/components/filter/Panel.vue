<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

import type { CategoryId } from '~/components/categories/types'
import type { WalletId } from '~/components/wallets/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { filterKey } from '~/components/filter/injectionKeys'
import { searchCategories, searchWallets } from '~/components/filter/search'
import { useSwiperTabs } from '~/components/filter/useSwiperTabs'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

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

const walletResults = computed<WalletId[]>(() => searchWallets(searchQuery.value, walletsStore.itemsComputed))

const categoryResults = computed<CategoryId[]>(() =>
  searchCategories(searchQuery.value, categoriesStore.items, categoriesStore.hasChildren),
)

const hasNoResults = computed(() =>
  !!searchQuery.value && walletResults.value.length === 0 && categoryResults.value.length === 0,
)

const sliderRef = ref<HTMLElement | null>(null)
const { activeTabIdx, goToTab } = useSwiperTabs(sliderRef, searchQuery)

const tabItems = computed<TabsItem[]>(() => [
  { label: t('wallets.title'), value: 0 },
  { label: t('categories.title'), value: 1 },
])
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
        class="m-0 min-h-10.5 w-0 min-w-0 flex-1 rounded-md border border-transparent bg-elevated/30 px-4 py-2 text-base font-normal outline-none placeholder:text-muted hover:bg-elevated/50 focus:border-primary focus:bg-elevated/50"
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
          <UTabs
            :content="false"
            :items="tabItems"
            :modelValue="activeTabIdx"
            @update:modelValue="(v) => goToTab(v as number)"
          />
        </div>

        <div
          ref="sliderRef"
          class="swiper size-full min-h-0 min-w-0 overflow-hidden"
        >
          <div class="swiper-wrapper">
            <div class="swiper-slide size-full">
              <FilterPanelWalletsTab
                :filterAtTop="props.isExpanded !== undefined"
                :selectedIds="pendingWallets"
                @selected="toggleWallet"
              />
            </div>
            <div class="swiper-slide size-full">
              <FilterPanelCategoriesTab
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
          class="p-4 text-center text-muted"
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
            class="flex items-center rounded-sm select-none hover:bg-elevated/50 [&_.uiElement:hover]:bg-transparent"
            @click="toggleWallet(walletId)"
          >
            <div
              class="relative flex-center w-10 shrink-0 self-stretch pl-2"
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
