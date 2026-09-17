<script setup lang="ts">
import type { DropdownMenuItem, TabsItem } from '@nuxt/ui'

import CategoriesSelectorModal from '~/components/categories/SelectorModal.vue'
import { filterKey } from '~/components/filter/injectionKeys'
import { useFilterDraft } from '~/components/filter/useFilterDraft'
import { useSwiperTabs } from '~/components/filter/useSwiperTabs'
import WalletsSelector from '~/components/wallets/Selector.vue'

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

const search = ref('')
// Function refs: the selectors sit inside the slide v-for, where a string ref becomes an array.
const walletsSelector = shallowRef<InstanceType<typeof WalletsSelector> | null>(null)
const categoriesSelector = shallowRef<InstanceType<typeof CategoriesSelectorModal> | null>(null)
const searchQuery = computed(() => search.value.trim().toLowerCase())
const isCreatingNewWallet = ref(false)
const isCreatingNewCategory = ref(false)

type FilterEntityType = 'category' | 'wallet'
type FilterSlide = FilterEntityType | 'more'

const entityTypes = computed<FilterEntityType[]>(() => [
  ...(filter.canFilterWallets ? ['wallet' as const] : []),
  ...(filter.canFilterCategories ? ['category' as const] : []),
])
const slides = computed<FilterSlide[]>(() => [...entityTypes.value, 'more'])

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

const { apply: applyDraft, hasPending, pendingCategories, pendingExtras, pendingWallets, reset, toggleCategory, toggleWallet } = useFilterDraft(filter)
// Reset stays reachable while any applied filter exists, so an emptied pending
// (which disables Apply) can never trap the user with a stale active filter.
const showReset = computed(() => hasPending.value || filter.isShow.value)

function apply() {
  applyDraft()
  emit('close')
}

const sliderRef = ref<HTMLElement | null>(null)
const { activeTabIdx, goToTab } = useSwiperTabs(sliderRef)

const tabItems = computed<TabsItem[]>(() => slides.value.map((slide, index) => ({
  label: t(slide === 'wallet' ? 'wallets.title' : slide === 'category' ? 'categories.title' : 'base.filtersMore'),
  value: index,
})))

const activeEntityType = computed(() => slides.value[activeTabIdx.value])
</script>

<template>
  <div
    class="relative grid w-full min-w-0 grid-rows-[auto_1fr] overflow-hidden [&_.scroller-block]:pb-20"
    :class="props.isExpanded === undefined
      ? 'max-h-[min(600px,85dvh)] min-h-[min(50dvh,600px)]'
      : 'h-full'"
  >
    <div class="relative z-20 bg-default/90 backdrop-blur">
      <FilterPanelHeader
        v-model:search="search"
        :activeSlide="activeEntityType"
        :categoriesSelector
        :createItems
        :isShowClose="isLaptop"
        :showReset
        :walletsSelector
        @close="emit('close')"
        @reset="reset"
      />

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
              v-for="slide in slides"
              :key="slide"
              class="swiper-slide size-full"
            >
              <FilterMoreForm
                v-if="slide === 'more'"
                v-model="pendingExtras"
              />
              <WalletsSelector
                v-else-if="slide === 'wallet'"
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

      <FilterSearchResults
        v-if="searchQuery"
        :pendingCategories
        :pendingWallets
        :searchQuery
        @toggleCategory="toggleCategory"
        @toggleWallet="toggleWallet"
      />
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
