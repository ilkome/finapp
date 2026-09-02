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
const router = useRouter()
const filter = inject(filterKey)!
const isLaptop = useIsLaptop()
const categoriesStore = useCategoriesStore()
const walletsStore = useWalletsStore()

const search = ref('')
const searchInput = useTemplateRef<HTMLInputElement>('searchInput')
const searchQuery = computed(() => search.value.trim().toLowerCase())
const isCreatingNewWallet = ref(false)
const isCreatingNewCategory = ref(false)

const createItems = computed(() => [
  { icon: 'i-hugeicons-wallet-01', label: t('base.addWallet'), value: 'wallet' },
  { icon: 'i-hugeicons-folder-library', label: t('base.addCategory'), value: 'category' },
])

function createEntity(value: string | undefined) {
  if (!value)
    return

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

function clearSearchOrFilter() {
  if (search.value) {
    search.value = ''
    focusSearch()
    return
  }

  reset()
}

const walletResults = computed<WalletId[]>(() =>
  searchWallets(searchQuery.value, walletsStore.itemsComputed),
)

const categoryResults = computed<CategoryId[]>(() =>
  searchCategories(searchQuery.value, categoriesStore.items, categoriesStore.hasChildren),
)

const hasNoResults = computed(() =>
  !!searchQuery.value && walletResults.value.length === 0 && categoryResults.value.length === 0,
)

const sliderRef = ref<HTMLElement | null>(null)
const { activeTabIdx, goToTab } = useSwiperTabs(sliderRef)

const tabItems = computed<TabsItem[]>(() => [
  { label: t('wallets.title'), value: 0 },
  { label: t('categories.title'), value: 1 },
])

async function focusSearch() {
  await nextTick()
  const focus = () => searchInput.value?.focus()
  requestAnimationFrame(focus)
  setTimeout(focus, 250)
}

onMounted(() => {
  if (isLaptop.value)
    focusSearch()
})
</script>

<template>
  <div
    class="relative grid w-full min-w-0 grid-rows-[auto_1fr] overflow-hidden [&_.scroller-block]:pb-20"
    :class="props.isExpanded === undefined
      ? 'max-h-[85dvh] min-h-[50dvh]'
      : 'h-full'"
  >
    <div
      class="relative z-20 bg-default/90 backdrop-blur"
    >
      <div class="flex items-center gap-2 px-3 py-2 md:px-1">
        <div class="relative min-w-0 flex-1">
          <input
            ref="searchInput"
            v-model="search"
            type="text"
            :aria-label="t('base.search')"
            class="m-0 min-h-10.5 w-full rounded-md border border-transparent bg-elevated/30 py-2 pr-11 pl-4 text-base font-normal outline-none placeholder:text-muted hover:bg-elevated/50 focus:border-primary focus:bg-elevated/50"
            :placeholder="t('base.search')"
          >
          <div
            v-if="search || showReset"
            class="absolute inset-y-1 right-1 aspect-square"
          >
            <UTooltip :text="search ? t('base.clear') : t('base.reset')">
              <button
                type="button"
                :aria-label="search ? t('base.clear') : t('base.reset')"
                class="flex size-full items-center justify-center rounded-full interactive bg-elevated text-muted"
                @click="clearSearchOrFilter"
              >
                <Icon name="lucide:x" size="18" />
              </button>
            </UTooltip>
          </div>
        </div>
        <USelect
          :aria-label="t('base.addWhat')"
          class="w-10.5"
          :content="{ align: 'end', position: 'popper' }"
          icon="i-lucide-plus"
          :items="createItems"
          modelValue=""
          :placeholder="t('base.addWhat')"
          :title="t('base.addWhat')"
          :ui="{
            base: 'min-h-10.5 justify-center rounded-full p-0',
            content: 'min-w-52',
            leading: 'inset-y-0 start-0 flex w-full items-center justify-center ps-0',
            placeholder: 'sr-only',
            value: 'sr-only',
            trailing: 'hidden',
          }"
          valueKey="value"
          @update:modelValue="value => createEntity(value as string | undefined)"
        />
      </div>

      <div v-show="!searchQuery" class="px-3 pb-px md:px-1">
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
            <div class="swiper-slide size-full">
              <WalletsSelector
                :autofocus="false"
                compactDesktop
                currencyAboveAction
                hideHeader
                :searchQuery
                :selectedIds="pendingWallets"
                withHeader
                @selected="toggleWallet"
              />
            </div>
            <div class="swiper-slide size-full">
              <CategoriesSelectorModal
                :autofocus="false"
                compactDesktop
                hideCreate
                hideSearch
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
