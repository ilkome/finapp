<script setup lang="ts">
import { useStorage } from '@vueuse/core'

import type { CategoryId } from '~/components/categories/types'
import type { StatTabSlug } from '~/components/stat/types'

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
const category = computed(() => categoriesStore.items[categoryId.value])
const preCategoriesIds = computed(() => categoriesStore.getChildsIds(categoryId.value))
const categoriesIdsOrParent = computed(() => categoriesStore.getChildsIdsOrParent(categoryId.value))

const activeTab = useStorage<StatTabSlug>(`${categoryId.value}-tab`, 'netIncome')
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

onActivated(() => {
  statConfig.updateConfig('catsList', { isGrouped: false })
  statConfig.updateConfig('catsRound', { isGrouped: false })

  if (categoriesStore.isItTransactible(categoryId.value))
    trnsFormStore.values.categoryId = categoryId.value
})

function onEditClick(close: () => void) {
  router.push(`/categories/${categoryId.value}/edit`)
  close()
}

useHead({ title: category.value?.name })
</script>

<template>
  <UiPage v-if="category">
    <StatHeader
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

      <template
        v-if="!categoriesStore.transferCategoriesIds.includes(categoryId)"
        #popover="{ close }"
      >
        <UiHeaderLink
          icon="mdi:pencil-outline"
          @click="onEditClick(close)"
        >
          {{ t('base.edit') }}
        </UiHeaderLink>

        <CategoriesDelete :categoryId @close="close" />
      </template>
    </StatHeader>

    <StatItemWrap
      :activeTab
      :hasChildren="categoriesIdsOrParent.length > 1"
      :preCategoriesIds
      :range="statDate.range.value"
      :storageKey
      :trnsIds
      isOneCategory
    />
  </UiPage>
</template>
