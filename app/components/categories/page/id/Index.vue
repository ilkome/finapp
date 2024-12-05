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
    <StatHeader
      :maxRange="maxRange"
      :filter="{ isShow: true, isShowCategories: true }"
      :config="{ isShowCategories: true }"
      :menu="{ active: activeTab, click: id => activeTab = id }"
    >
      <template #title>
        <CategoriesHeader
          :category="category"
          :parentCategory="categoriesStore.items[category.parentId]"
        />
      </template>

      <template #actions>
        <UiHeaderLink
          v-if="!categoriesStore.transferCategoriesIds.includes(categoryId)"
          @click="router.push(`/categories/${categoryId}/edit`)"
        >
          <div class="mdi mdi-pencil-outline text-xl group-hover:text-white" />
        </UiHeaderLink>
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

      <div class="invisible max-w-sm md:visible">
        <UiToggle2
          :initStatus="true"
          class="hidden md:grid md:max-w-xl"
          openPadding="!pb-6"
          storageKey="finapp-wallets-currencies"
        >
          <template #header="{ toggle, isShown }">
            <UiTitle8
              :isShown
              @click="toggle"
            >
              {{ t('dates.selector.title') }}
            </UiTitle8>
          </template>

          <StatDateSelector
            :maxRange
          />
        </UiToggle2>
      </div>
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
