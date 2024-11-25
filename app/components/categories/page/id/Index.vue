<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import type { CategoryId } from '~/components/categories/types'
import type { StatTabs } from '~/components/app/types'
import type { WalletId } from '~/components/wallets/types'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useFilter } from '~/components/filter/useFilter'
import { useStatConfig } from '~/components/stat/useStatConfig'
import { useStatDate } from '~/components/date/useStatDate'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import type { StatDateParams } from '~/components/date/types'

const categoriesStore = useCategoriesStore()
const filter = useFilter()
const route = useRoute()
const router = useRouter()
const trnsFormStore = useTrnsFormStore()
const trnsStore = useTrnsStore()
const walletsStore = useWalletsStore()

provide('filter', filter)

const categoryId = computed(() => route.params.id) as ComputedRef<CategoryId>
const category = ref(categoriesStore.items[categoryId.value])
const categoryHasChildren = computed(() => categoriesStore.hasChildren(categoryId.value))
const childIds = computed(() => categoriesStore.getChildsIds(categoryId.value))
const categoriesIdsOrParent = computed(() => categoriesStore.getChildsIdsOrParent(categoryId.value))
const trnsIds = computed(() => trnsStore.getStoreTrnsIds({
  categoriesIds: categoriesIdsOrParent.value,
  walletsIds: filter?.walletsIds?.value ?? [],
}))
const maxRange = computed(() => trnsStore.getRange(trnsIds.value))

if (!category.value)
  router.replace('/categories')

const statDateParams = useStorage<StatDateParams>(`finapp-${categoryId.value}-`)

const statDate = useStatDate({
  // initParams: {
  //   intervalsBy: calculateBestIntervalsBy(maxRange.value),
  //   isShowMaxRange: true,
  //   isSkipEmpty: true,
  // },
  key: `finapp-${categoryId.value}-`,
  maxRange,
  queryParams: route.query,
})
provide('statDate', statDate)

const statConfig = useStatConfig({
  props: {
    isShowEmptyCategories: true,
  },
  storageKey: categoryId.value,
})
provide('statConfig', statConfig)

if (!category.value)
  router.replace('/categories')

const activeTab = useStorage<StatTabs>(`${categoryId.value}-tab`, 'netIncome')
const storageKey = computed(() => `${categoryId.value}-${activeTab.value}`)

const expenseTrnsIds = computed(() => trnsStore.getStoreTrnsIds({
  trnsIds: trnsIds.value,
  trnsTypes: [0, 2],
}, {
  includesChildCategories: true,
}))

const incomeTrnsIds = computed(() => trnsStore.getStoreTrnsIds({
  trnsIds: trnsIds.value,
  trnsTypes: [1, 2],
}, {
  includesChildCategories: true,
}))

const sortedFilterWalletsIds = computed(() => {
  const filteredIds = filter.walletsIds.value
  const showedIds = walletsStore.sortedIds.slice(0, statConfig.config.value.showedWallets)
  return [...new Set([...showedIds, ...filteredIds])]
})

function onClickWallet(walletId: WalletId) {
  filter.toggleWalletId(walletId)
  trnsFormStore.values.walletId = walletId
}

useHead({ title: category.value?.name })
</script>

<template>
  <UiPage v-if="category">
    <div class="bg-foreground-3 sticky top-0 z-20 grid max-w-6xl gap-2 pb-2 lg:px-4 xl:py-2">
      <div class="grid gap-2 px-2 pt-2">
        <div class="flex items-center gap-1 overflow-x-auto ">
          <FilterSelector
            isShowCategories
            isShowWallets
          />
          <StatMenu2
            :active="activeTab"
            isShowNet=""
            isShowIncome=""
            isShowSummary=""
            @click="id => activeTab = id"
          />

          <div class="flex items-center gap-2">
            <UiHeaderLink
              v-if="!categoriesStore.transferCategoriesIds.includes(categoryId)"
              @click="router.push(`/categories/${categoryId}/edit`)"
            >
              <div class="mdi mdi-pencil-outline text-xl group-hover:text-white" />
            </UiHeaderLink>
            <StatConfigPopover isShowWallets />
          </div>
        </div>

        <FilterSelected
          v-if="filter.isShow?.value && filter.catsIds.value.length > 0"
          isShowCategories
        />
      </div>

      <CategoriesHeader
        :category="category"
        :parentCategory="categoriesStore.items[category.parentId]"
      />
    </div>

    <div
      v-if="trnsIds.length > 0 || filter.isShow?.value"
      class="px-2 pt-2 md:px-6"
    >
      <FilterSelector
        isShowWallets
        class="pb-2"
      />
      <FilterSelected
        v-if="filter.isShow?.value"
        isShowCategories
        isShowWallets
      />
    </div>

    <!-- NetIncome -->
    <div
      v-if="activeTab === 'netIncome'"
      class="max-w-6xl gap-4 pb-24 md:grid-cols-2 lg:gap-8 lg:px-4 xl:py-2"
    >
      <StatItemForCategory
        :storageKey="storageKey + activeTab"
        :trnsIds="trnsIds"
        hasChildren
        type="sum"
      />
    </div>

    <!-- Summary -->
    <div
      v-if="activeTab === 'sum'"
      class="grid max-w-6xl gap-4 pb-24 md:grid-cols-2 lg:gap-8 lg:px-4 xl:py-2"
    >
      <StatItemForCategory
        :storageKey="storageKey + activeTab"
        :trnsIds="expenseTrnsIds"
        hasChildren
        type="expense"
      />

      <StatItemForCategory
        :storageKey="storageKey + activeTab"
        :trnsIds="incomeTrnsIds"
        hasChildren
        type="income"
      />
    </div>
  </UiPage>
</template>
