<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import type { CategoryId } from '~/components/categories/types'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useFilter } from '~/components/filter/useFilter'
import { useStatConfig } from '~/components/stat/useStatConfig'
import { useStatDate } from '~/components/date/useStatDate'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import type { MoneyTypeSlugNew } from '~/components/stat/types'

const { t } = useI18n()
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
const preCategoriesIds = computed(() => [...categoriesStore.getChildsIds(categoryId.value)])
const categoriesIdsOrParent = computed(() => categoriesStore.getChildsIdsOrParent(categoryId.value))

const trnsIds = computed(() => {
  const categoriesIds = [...filter.categoriesIds.value, ...categoriesIdsOrParent.value]
  return trnsStore.getStoreTrnsIds({
    categoriesIds,
    walletsIds: filter?.walletsIds?.value ?? [],
  })
})
const maxRange = computed(() => trnsStore.getRange(trnsIds.value))

if (!category.value)
  router.replace('/categories')

const statDate = useStatDate({
  key: `finapp-stat-${categoryId.value}-${route.query.storageKey}`,
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
    isShowEmptyCategories: false,
  },
  storageKey: `finapp-stat2-${categoryId.value}-${route.query.storageKey}`,
})
provide('statConfig', statConfig)

if (!category.value)
  router.replace('/dashboard')

onMounted(() => {
  statConfig.updateConfig('catsList', {
    ...statConfig.config.value.catsList,
    isGrouped: false,
  })
  statConfig.updateConfig('catsRound', {
    ...statConfig.config.value.catsRound,
    isGrouped: false,
  })

  if (categoriesStore.isItTransactible(categoryId.value))
    trnsFormStore.values.categoryId = categoryId.value
})

const activeTab = useStorage<MoneyTypeSlugNew>(`${categoryId.value}-tab`, 'netIncome')
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
    <StatHeader
      :filter="{
        isShowCategories: true,
        isShowWallets: true,
        isShow: true,
        isShowSelected: filter.isShow?.value && filter.categoriesIds.value.length > 0,
      }"
      :maxRange
      :config="{
        isShowWallets: true,
      }"
      :menu="{
        active: activeTab,
        click: id => activeTab = id,
      }"
    >
      <template #title>
        <CategoriesHeader
          :category="category"
          :parentCategory="categoriesStore.items[category.parentId]"
        />
      </template>

      <template #actions>
        <UiElement
          v-if="!categoriesStore.transferCategoriesIds.includes(categoryId)"
          @click="router.push(`/categories/${categoryId}/edit`)"
        >
          <template #leftIcon>
            <UiIconBase
              name="mdi mdi-pencil-outline group-hover/link:text-1 text-lg leading-none"
            />
          </template>

          {{ t('categories.editTitle') }}
        </UiElement>
      </template>
    </StatHeader>

    <!-- NetIncome -->
    <div
      v-if="activeTab === 'netIncome'"
      class="statWrapSummary"
    >
      <StatItem
        :storageKey
        :trnsIds="trnsIds"
        :preCategoriesIds
        :hasChildren="categoryHasChildren"
        type="sum"
      />
    </div>

    <!-- Summary -->
    <div
      v-if="activeTab === 'sum'"
      class="statWrapSummary"
    >
      <StatItem
        :storageKey
        :trnsIds="expenseTrnsIds"
        :preCategoriesIds
        :hasChildren="categoryHasChildren"
        type="expense"
      />

      <StatItem
        :storageKey
        :trnsIds="incomeTrnsIds"
        :preCategoriesIds
        :hasChildren="categoryHasChildren"
        type="income"
      />
    </div>
  </UiPage>
</template>
