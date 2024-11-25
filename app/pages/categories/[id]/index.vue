<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import type { CategoryId } from '~/components/categories/types'
import type { StatTabs } from '~/components/app/types'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useFilter } from '~/components/filter/useFilter'
import { useStatConfig } from '~/components/stat/useStatConfig'
import { useStatDate } from '~/components/date/useStatDate'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const categoriesStore = useCategoriesStore()
const filter = useFilter()
const route = useRoute()
const router = useRouter()
const trnsFormStore = useTrnsFormStore()
const trnsStore = useTrnsStore()

provide('filter', filter)

const categoryId = computed(() => route.params.id) as ComputedRef<CategoryId>
const category = ref(categoriesStore.items[categoryId.value])
const categoryHasChildren = computed(() => categoriesStore.hasChildren(categoryId.value))
const childIds = computed(() => [...categoriesStore.getChildsIds(categoryId.value), ...filter.catsIds.value])
const categoriesIdsOrParent = computed(() => categoriesStore.getChildsIdsOrParent(categoryId.value))
const trnsIds = computed(() => trnsStore.getStoreTrnsIds({
  categoriesIds: categoriesIdsOrParent.value,
  walletsIds: filter?.walletsIds?.value ?? [],
}))
const maxRange = computed(() => trnsStore.getRange(trnsIds.value))

if (!category.value)
  router.replace('/categories')

const statDate = useStatDate({
  key: `finapp-${categoryId.value}-${route.query.storageKey}`,
  maxRange,
  queryParams: route.query,
})
provide('statDate', statDate)

const statConfig = useStatConfig({
  props: {
    catsList: {
      isGrouped: false,
    },
    catsRound: {
      isGrouped: false,
    },
    isCategoryPage: true,
    isShowEmptyCategories: true,
  },
  storageKey: categoryId.value,
})
provide('statConfig', statConfig)

if (!category.value)
  router.replace('/categories')

watch(filter.catsIds, () => {
  if (filter.catsIds.value.length > 0) {
    statConfig.config.value.isShowEmptyCategories = true
  }
  else {
    statConfig.config.value.isShowEmptyCategories = false
  }
})

onMounted(() => {
  if (categoriesStore.isItTransactible(categoryId.value))
    trnsFormStore.values.categoryId = categoryId.value
})

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

useHead({ title: category.value?.name })
</script>

<template>
  <UiPage v-if="category">
    <div class="bg-foreground-3 sticky top-0 z-20 grid max-w-6xl gap-2 py-2 lg:px-4 xl:py-2">
      <div class="flex gap-2 px-3">
        <CategoriesHeader
          :category="category"
          :parentCategory="categoriesStore.items[category.parentId]"
        />

        <div class="ml-auto flex items-center gap-2">
          <UiHeaderLink
            v-if="!categoriesStore.transferCategoriesIds.includes(categoryId)"
            @click="router.push(`/categories/${categoryId}/edit`)"
          >
            <div class="mdi mdi-pencil-outline text-xl group-hover:text-white" />
          </UiHeaderLink>
          <StatConfigPopover />
        </div>
      </div>

      <div class="grid gap-2 px-2">
        <div class="flex items-center gap-1 overflow-x-auto">
          <FilterSelector
            isShowWallets
          />
          <StatMenu
            :active="activeTab"
            isShowNet=""
            isShowIncome=""
            isShowSummary=""
            @click="id => activeTab = id"
          />
        </div>
        <FilterSelected
          v-if="filter.isShow?.value"
          isShowWallets
        />
      </div>
    </div>

    <!-- NetIncome -->
    <div
      v-if="activeTab === 'netIncome'"
      class="max-w-6xl gap-4 pb-24 md:grid-cols-2 lg:gap-8 lg:px-4 xl:py-2"
    >
      <StatItem
        :storageKey="storageKey + activeTab"
        :trnsIds="trnsIds"
        :preCategoriesIds="childIds"
        :hasChildren="categoryHasChildren"
        isCategoryPage
        type="sum"
      />
    </div>

    <!-- Summary -->
    <div
      v-if="activeTab === 'sum'"
      class="grid max-w-6xl gap-4 pb-24 md:grid-cols-2 lg:gap-8 lg:px-4 xl:py-2"
    >
      <StatItem
        :storageKey="storageKey + activeTab"
        :trnsIds="expenseTrnsIds"
        :preCategoriesIds="childIds"
        :hasChildren="categoryHasChildren"
        isCategoryPage
        type="expense"
      />

      <StatItem
        :storageKey="storageKey + activeTab"
        :trnsIds="incomeTrnsIds"
        :preCategoriesIds="childIds"
        :hasChildren="categoryHasChildren"
        isCategoryPage
        type="income"
      />
    </div>
  </UiPage>
</template>
