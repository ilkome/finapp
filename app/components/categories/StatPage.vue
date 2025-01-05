<script setup lang="ts">
import { useStorage } from '@vueuse/core'

import type { CategoryId } from '~/components/categories/types'
import type { MoneyTypeSlugNew } from '~/components/stat/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useStatDate } from '~/components/date/useStatDate'
import { useFilter } from '~/components/filter/useFilter'
import { useStatConfig } from '~/components/stat/useStatConfig'
import { getTypesMapping } from '~/components/stat/utils'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const { t } = useI18n()
const trnsStore = useTrnsStore()
const trnsFormStore = useTrnsFormStore()
const router = useRouter()
const route = useRoute()
const categoriesStore = useCategoriesStore()

const filter = useFilter()
provide('filter', filter)

const categoryId = computed(() => route.params.id) as ComputedRef<CategoryId>
const category = ref(categoriesStore.items[categoryId.value])
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
    isShowEmptyCategories: false,
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

if (!category.value)
  router.replace('/dashboard')

onMounted(() => {
  statConfig.updateConfig('catsList', { isGrouped: false })
  statConfig.updateConfig('catsRound', { isGrouped: false })

  if (categoriesStore.isItTransactible(categoryId.value))
    trnsFormStore.values.categoryId = categoryId.value
})

useHead({ title: category.value?.name })
</script>

<template>
  <UiPage v-if="category">
    <StatHeader
      :filter="{
        isShowCategories: false,
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

      <template #popover>
        <UiHeaderLink
          v-if="!categoriesStore.transferCategoriesIds.includes(categoryId)"
          icon="mdi:pencil-outline"
          @click="router.push(`/categories/${categoryId}/edit`)"
        >
          {{ t('base.edit') }}
        </UiHeaderLink>
      </template>
    </StatHeader>

    <StatItemWrap
      :activeTab
      :trnsIds
      :storageKey
      :hasChildren="categoriesIdsOrParent.length > 1"
    />
  </UiPage>
</template>
