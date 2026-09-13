<script setup lang="ts">
import type { DropdownMenuItem, TabsItem } from '@nuxt/ui'

import type { CategoryId } from '~/components/categories/types'
import type { WalletId } from '~/components/wallets/types'

import CategoriesSelectorModal from '~/components/categories/SelectorModal.vue'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { filterKey } from '~/components/filter/injectionKeys'
import { searchCategories, searchWallets } from '~/components/filter/search'
import { useSwiperTabs } from '~/components/filter/useSwiperTabs'
import WalletsSelector from '~/components/wallets/Selector.vue'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  isExpanded?: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const { t } = useI18n()
const router = useRouter()
const filter = inject(filterKey)!
const isLaptop = useIsLaptop()
const categoriesStore = useCategoriesStore()
const walletsStore = useWalletsStore()

const search = ref('')
const searchInput = useTemplateRef<HTMLInputElement>('searchInput')
const isSearchOpen = ref(false)
// Function refs: the selectors sit inside the slide v-for, where a string ref becomes an array.
const walletsSelector = shallowRef<InstanceType<typeof WalletsSelector> | null>(null)
const categoriesSelector = shallowRef<InstanceType<typeof CategoriesSelectorModal> | null>(null)
const searchQuery = computed(() => search.value.trim().toLowerCase())
const isCreatingNewWallet = ref(false)
const isCreatingNewCategory = ref(false)

type FilterEntityType = 'category' | 'wallet'

const entityTypes = computed<FilterEntityType[]>(() => [
  ...(filter.canFilterWallets ? ['wallet' as const] : []),
  ...(filter.canFilterCategories ? ['category' as const] : []),
])

const createItems = computed<DropdownMenuItem[]>(() => entityTypes.value.map(value => ({
  icon: value === 'wallet' ? 'i-hugeicons-wallet-01' : 'i-hugeicons-folder-library',
  label: t(value === 'wallet' ? 'base.addWallet' : 'base.addCategory'),
  onSelect: () => createEntity(value),
})))

function createEntity(value: FilterEntityType) {
  if (isLaptop.value) {
    router.push(value === 'wallet' ? '/wallets/new?returnBack=1' : '/categories/new?returnBack=1')
    emit('close')
    return
  }

  if (value === 'wallet')
    isCreatingNewWallet.value = true
  else
    isCreatingNewCategory.value = true
}

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

function apply() {
  filter.applyFilter(pendingWallets.value, pendingCategories.value)
  emit('close')
}

function reset() {
  pendingWallets.value = []
  pendingCategories.value = []
  filter.applyFilter([], [])
}

function openSearch() {
  isSearchOpen.value = true
  focusSearch()
}

function closeSearch() {
  search.value = ''
  isSearchOpen.value = false
}

const walletResults = computed<WalletId[]>(() =>
  filter.canFilterWallets ? searchWallets(searchQuery.value, walletsStore.itemsComputed) : [],
)

const categoryResults = computed<CategoryId[]>(() =>
  filter.canFilterCategories
    ? searchCategories(searchQuery.value, categoriesStore.items, categoriesStore.hasChildren)
    : [],
)

const hasNoResults = computed(() =>
  !!searchQuery.value && walletResults.value.length === 0 && categoryResults.value.length === 0,
)

const sliderRef = ref<HTMLElement | null>(null)
const { activeTabIdx, goToTab } = useSwiperTabs(sliderRef)

const tabItems = computed<TabsItem[]>(() => entityTypes.value.map((type, index) => ({
  label: t(type === 'wallet' ? 'wallets.title' : 'categories.title'),
  value: index,
})))

async function focusSearch() {
  await nextTick()
  const focus = () => searchInput.value?.focus()
  requestAnimationFrame(focus)
  setTimeout(focus, 250)
}

const activeEntityType = computed(() => entityTypes.value[activeTabIdx.value])
</script>

<template>
  <div
    class="relative grid w-full min-w-0 grid-rows-[auto_1fr] overflow-hidden [&_.scroller-block]:pb-20"
    :class="props.isExpanded === undefined
      ? 'max-h-[min(600px,85dvh)] min-h-[min(50dvh,600px)]'
      : 'h-full'"
  >
    <div class="relative z-20 bg-default/90 backdrop-blur">
      <div class="relative flex min-h-12 items-center gap-1 px-3 md:px-1">
        <div class="grow font-tertiary text-lg leading-none font-semibold">
          {{ t('base.filters') }}
        </div>

        <template v-if="activeEntityType === 'wallet' && walletsSelector">
          <UDropdownMenu
            :content="{ align: 'end' }"
            :items="walletsSelector.groupingItems"
            :modal="false"
          >
            <UiTriggerButton icon="lucide:list-tree" :title="t('base.toggleGrouping')" />
          </UDropdownMenu>
        </template>

        <template v-if="activeEntityType === 'category' && categoriesSelector">
          <UiTriggerButton
            v-if="categoriesSelector.filter === 'all'"
            :icon="categoriesSelector.view === 'list' ? 'lucide:layout-grid' : 'lucide:list'"
            :title="t('base.toggleView')"
            @click="categoriesSelector.view = categoriesSelector.view === 'list' ? 'grid' : 'list'"
          />
          <UiTriggerButton
            v-if="categoriesSelector.filter === 'all'"
            :icon="categoriesSelector.folderIcon"
            :title="t('base.toggleFolders')"
            @click="categoriesSelector.toggleAll()"
          />
          <UiTriggerButton
            v-if="categoriesSelector.hasFavoritesOrRecent"
            icon="lucide:star"
            :isActive="categoriesSelector.filter === 'favorites'"
            :title="t('categories.favorite')"
            @click="categoriesSelector.toggleFavoritesFilter()"
          />
        </template>

        <UDropdownMenu
          :content="{ align: 'end' }"
          :items="createItems"
          :modal="false"
          :ui="{ content: 'min-w-52' }"
        >
          <UiTriggerButton icon="lucide:plus" :title="t('base.addWhat')" />
        </UDropdownMenu>

        <UiTriggerButton
          v-if="showReset"
          icon="lucide:filter-x"
          :title="t('base.reset')"
          @click="reset"
        />

        <UiTriggerButton icon="lucide:search" :title="t('base.search')" @click="openSearch" />

        <UiTriggerButton
          v-if="isLaptop"
          icon="lucide:x"
          :title="t('base.close')"
          @click="emit('close')"
        />

        <!-- Expanded search covers the title and the toolbar. -->
        <div
          v-if="isSearchOpen"
          class="absolute inset-x-3 inset-y-1 z-10 rounded-md bg-default md:inset-x-1"
        >
          <input
            ref="searchInput"
            v-model="search"
            type="text"
            :aria-label="t('base.search')"
            class="m-0 size-full rounded-md border border-transparent bg-elevated/30 py-2 pr-11 pl-4 text-base font-normal outline-none placeholder:text-muted hover:bg-elevated/50 focus:border-primary focus:bg-elevated/50"
            :placeholder="t('base.search')"
            @keydown.escape.stop="closeSearch"
          >
          <div class="absolute inset-y-1 right-1 aspect-square">
            <UTooltip :text="t('base.close')">
              <button
                type="button"
                :aria-label="t('base.close')"
                class="flex size-full items-center justify-center rounded-full interactive bg-elevated text-muted"
                @click="closeSearch"
              >
                <Icon name="lucide:x" size="18" />
              </button>
            </UTooltip>
          </div>
        </div>
      </div>

      <div v-if="tabItems.length > 1 && !searchQuery" class="px-3 pb-px md:px-1">
        <UiTabs
          isEqual
          :items="tabItems"
          :modelValue="activeTabIdx"
          @update:modelValue="(v) => goToTab(v as number)"
        />
      </div>
    </div>

    <div class="min-h-0 min-w-0">
      <div v-show="!searchQuery" class="grid h-full min-h-0">
        <div
          ref="sliderRef"
          class="swiper size-full min-h-0 min-w-0 overflow-hidden"
        >
          <div class="swiper-wrapper">
            <div
              v-for="entityType in entityTypes"
              :key="entityType"
              class="swiper-slide size-full"
            >
              <WalletsSelector
                v-if="entityType === 'wallet'"
                :ref="(el: any) => walletsSelector = el"
                :autofocus="false"
                compactDesktop
                currencyAboveAction
                groupingMenu
                hideHeader
                :searchQuery
                :selectedIds="pendingWallets"
                withHeader
                @selected="toggleWallet"
              />
              <CategoriesSelectorModal
                v-else
                :ref="(el: any) => categoriesSelector = el"
                :autofocus="false"
                compactDesktop
                hideHeader
                :searchQuery
                :selectedIds="pendingCategories"
                @selected="toggleCategory"
              />
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="searchQuery"
        class="h-full scroller-block overflow-y-auto px-3 pb-20 md:px-1"
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
          <div class="grid gap-1 pt-1">
            <div
              v-for="walletId in walletResults"
              :key="walletId"
              :class="cn(
                'flex items-center rounded-md border border-transparent bg-elevated/30 select-none hover:bg-elevated/50 [&_.uiElement:hover]:bg-transparent',
                pendingWallets.includes(walletId) && 'border-primary/40',
              )"
              @click="toggleWallet(walletId)"
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
            :selectedIds="pendingCategories"
            class="pt-1"
            @selected="toggleCategory"
          />
        </template>
      </div>
    </div>

    <div
      class="absolute inset-x-0 bottom-0 z-10 flex items-center gap-2 px-3 py-2 md:px-1"
      :style="props.isExpanded !== undefined
        ? { transform: 'translateY(calc(-1 * var(--sheet-ty, 0px)))' }
        : undefined"
    >
      <div
        class="pointer-events-none absolute inset-x-0 -top-6 bottom-0 -z-10"
        style="background: linear-gradient(to bottom, transparent, var(--ui-bg))"
      />
      <div class="min-w-0 flex-1">
        <UiButtonAccent
          :disabled="!hasPending"
          size="xl"
          @click="apply"
        >
          {{ t('base.apply') }}
        </UiButtonAccent>
      </div>
    </div>

    <WalletsEditModal
      v-if="isCreatingNewWallet && !isLaptop"
      @closed="isCreatingNewWallet = false"
    />
    <CategoriesEditModal
      v-if="isCreatingNewCategory && !isLaptop"
      @closed="isCreatingNewCategory = false"
    />
  </div>
</template>
