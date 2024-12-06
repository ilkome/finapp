<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import type { CategoryId } from '~/components/categories/types'
import type { MoneyTypeSlugNew } from '~/components/stat/types'
import { getTypesMapping } from '~/components/stat/utils'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useFilter } from '~/components/filter/useFilter'
import { useStatConfig } from '~/components/stat/useStatConfig'
import { useStatDate } from '~/components/date/useStatDate'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const trnsStore = useTrnsStore()
const trnsFormStore = useTrnsFormStore()
const router = useRouter()
const route = useRoute()
const categoriesStore = useCategoriesStore()

const filter = useFilter()
provide('filter', filter)

const categoryId = computed(() => route.params.id) as ComputedRef<CategoryId>
const category = ref(categoriesStore.items[categoryId.value])
const preCategoriesIds = computed(() => [...categoriesStore.getChildsIds(categoryId.value)])
const categoriesIdsOrParent = computed(() => categoriesStore.getChildsIdsOrParent(categoryId.value))

const activeTab = useStorage<MoneyTypeSlugNew>(`${categoryId.value}-tab`, 'netIncome')
const storageKey = computed(() => `${categoryId.value}-${activeTab.value}`)

const trnsIds = computed(() => {
  const categoriesIds = [...filter.categoriesIds.value, ...categoriesIdsOrParent.value]
  return trnsStore.getStoreTrnsIds({
    categoriesIds,
    trnsTypes: getTypesMapping(activeTab.value),
    walletsIds: filter?.walletsIds?.value ?? [],
  })
})

const maxRange = computed(() => trnsStore.getRange(trnsIds.value))

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
  storageKey: storageKey.value,
})
provide('statConfig', statConfig)

const statDate = useStatDate({
  key: storageKey.value,
  maxRange,
  queryParams: route.query,
})
provide('statDate', statDate)

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

function onEditClick() {
  router.push(`/categories/${categoryId.value}/edit`)
}

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
          @click="onEditClick"
        >
          <div class="mdi mdi-pencil-outline text-xl group-hover:text-white" />
        </UiHeaderLink>
      </template>
    </StatHeader>

    <StatItemWrap
      :activeTab
      :trnsIds
      :storageKey
      :preCategoriesIds
    />
  </UiPage>
</template>
