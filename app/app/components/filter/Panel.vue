<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

import type { CategoryId } from '~/components/categories/types'
import type { WalletId } from '~/components/wallets/types'

import CategoriesSelectorModal from '~/components/categories/SelectorModal.vue'
import { useAfterDrawerClosed } from '~/components/drawer/useAfterDrawerClosed'
import { filterKey } from '~/components/filter/injectionKeys'
import { useFilterDraft } from '~/components/filter/useFilterDraft'
import { useSwiperTabs } from '~/components/filter/useSwiperTabs'
import WalletsSelector from '~/components/wallets/Selector.vue'

const props = withDefaults(defineProps<{
  // 'select': a single-pick entity sheet (transaction form) - no draft, no Apply, picking
  // an item closes the sheet right away instead of staging it for the URL filter.
  activeCategoryId?: CategoryId
  activeWalletId?: WalletId
  /** Entity tabs only, without the extras slide. */
  hideMore?: boolean
  initialSlide?: 'category' | 'wallet'
  mode?: 'filter' | 'select'
  title?: string
}>(), {
  initialSlide: 'wallet',
  mode: 'filter',
})

const emit = defineEmits<{
  close: []
  selectCategory: [id: CategoryId]
  selectWallet: [id: WalletId]
}>()

const { t } = useI18n()
const router = useRouter()
const isSelectMode = computed(() => props.mode === 'select')
const filter = isSelectMode.value ? null : inject(filterKey)!
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

const entityTypes = computed<FilterEntityType[]>(() => isSelectMode.value
  ? ['wallet', 'category']
  : [
      ...(filter!.canFilterWallets ? ['wallet' as const] : []),
      ...(filter!.canFilterCategories ? ['category' as const] : []),
    ])
const slides = computed<FilterSlide[]>(() => isSelectMode.value || props.hideMore ? entityTypes.value : [...entityTypes.value, 'more'])

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

const draft = isSelectMode.value ? null : useFilterDraft(filter!)
// Reset stays reachable while any applied filter exists, so an emptied pending
// (which disables Apply) can never trap the user with a stale active filter.
const showReset = computed(() => !isSelectMode.value && (draft!.hasPending.value || filter!.isShow.value))

const afterDrawerClosed = useAfterDrawerClosed()
function apply() {
  afterDrawerClosed(() => draft!.apply())
  emit('close')
}

function selectWallet(id: WalletId) {
  if (isSelectMode.value) {
    emit('selectWallet', id)
    emit('close')
  }
  else {
    draft!.toggleWallet(id)
  }
}

function selectCategory(id: CategoryId) {
  if (isSelectMode.value) {
    emit('selectCategory', id)
    emit('close')
  }
  else {
    draft!.toggleCategory(id)
  }
}

const sliderRef = ref<HTMLElement | null>(null)
const { activeTabIdx, goToTab } = useSwiperTabs(sliderRef, isSelectMode.value ? slides.value.indexOf(props.initialSlide) : 0)

const tabItems = computed<TabsItem[]>(() => slides.value.map((slide, index) => ({
  label: t(slide === 'wallet' ? 'wallets.title' : slide === 'category' ? 'categories.title' : 'base.filtersMore'),
  value: index,
})))

const activeEntityType = computed(() => slides.value[activeTabIdx.value])
const headerTitle = computed(() => props.title ?? (isSelectMode.value
  ? t(activeEntityType.value === 'wallet' ? 'wallets.singular' : 'categories.singular')
  : undefined))
</script>

<template>
  <div
    class="
      relative grid max-h-[min(600px,85dvh)] min-h-[min(50dvh,600px)] w-full min-w-0 grid-rows-[auto_1fr]
      overflow-hidden group-data-snap/drawer:h-full group-data-snap/drawer:max-h-none
      group-data-snap/drawer:min-h-0
    "
    :class="!isSelectMode && '[&_.scroller-block]:pb-20'"
  >
    <div class="relative z-20 bg-default/90 backdrop-blur">
      <FilterPanelHeader
        :isShowClose="isLaptop"
        :mode="props.mode"
        :showReset
        :title="headerTitle"
        @close="emit('close')"
        @reset="draft?.reset()"
      />

      <div v-if="tabItems.length > 1 && !searchQuery" class="px-3 pb-px">
        <UiTabs
          isEqual
          :items="tabItems"
          :modelValue="activeTabIdx"
          @update:modelValue="(v) => goToTab(v as number)"
        />
      </div>
    </div>

    <div class="min-h-0 min-w-0">
      <div class="grid h-full min-h-0">
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
                :modelValue="draft!.pendingExtras.value" @update:modelValue="v => draft!.pendingExtras.value = v"
              />
              <template v-else>
                <div class="flex size-full min-h-0 flex-col">
                  <FilterSelectToolbar
                    v-model:search="search"
                    :activeSlide="slide"
                    :categoriesSelector
                    :walletsSelector
                    @addActive="createEntity(slide)"
                  />

                  <!-- The search spans every entity, so each slide shows the same results under its toolbar. -->
                  <div v-if="searchQuery" class="grid min-h-0 flex-1">
                    <FilterSearchResults
                      v-if="searchQuery"
                      :pendingCategories="draft?.pendingCategories.value ?? (props.activeCategoryId ? [props.activeCategoryId] : [])"
                      :pendingWallets="draft?.pendingWallets.value ?? (props.activeWalletId ? [props.activeWalletId] : [])"
                      :searchQuery
                      @toggleCategory="selectCategory"
                      @toggleWallet="selectWallet"
                    />
                  </div>

                  <!-- A 2px gap under the toolbar, outside the scroller: padding there would leave a slit above sticky titles. -->
                  <div v-show="!searchQuery" class="grid min-h-0 flex-1 pt-0.5 [&_.scroller-block]:pt-0!">
                    <WalletsSelector
                      v-if="slide === 'wallet'"
                      ref="walletsSelector"
                      :activeItemId="isSelectMode ? props.activeWalletId : undefined"
                      :autofocus="false"
                      groupingMenu
                      :storageScope="isSelectMode ? 'select' : 'filter'"
                      hideHeader
                      :searchQuery
                      :selectedIds="isSelectMode ? undefined : draft!.pendingWallets.value"
                      withHeader
                      @selected="selectWallet"
                    />
                    <CategoriesSelectorModal
                      v-else
                      ref="categoriesSelector"
                      :activeItemId="isSelectMode ? props.activeCategoryId : undefined"
                      :autofocus="false"
                      hideHeader
                      :searchQuery
                      :selectedIds="isSelectMode ? undefined : draft!.pendingCategories.value"
                      @selected="selectCategory"
                    />
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="!isSelectMode"
      class="absolute inset-x-0 bottom-0 z-10 flex items-center gap-2 px-3 py-2 transition-transform duration-450 ease-[cubic-bezier(0.32,0.72,0,1)]"
      style="transform: translateY(calc(-1 * var(--drawer-snap-lift, 0px)))"
    >
      <div
        class="pointer-events-none absolute inset-x-0 -top-6 bottom-0 -z-10"
        style="background: linear-gradient(to bottom, transparent, var(--ui-bg))"
      />
      <div class="min-w-0 flex-1">
        <UiButtonAccent
          :disabled="!draft!.hasPending.value"
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
