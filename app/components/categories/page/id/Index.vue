<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { differenceInDays } from 'date-fns'

import type { CategoryId } from '~/components/categories/types'
import type { StatTabSlug } from '~/components/stat/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useStatDate } from '~/components/date/useStatDate'
import { calculateBestIntervalsBy } from '~/components/date/utils'
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

const activeTab = useStorage<StatTabSlug>(`page-${categoryId.value}-tab`, 'netIncome')
const storageKey = computed(() => `page-${categoryId.value}-${activeTab.value}`)

const trnsIds = computed(() => trnsStore.getStoreTrnsIds({
  categoriesIds: [...filter.categoriesIds.value, ...categoriesIdsOrParent.value],
  trnsTypes: getTypesMapping(activeTab.value),
  walletsIds: filter?.walletsIds?.value ?? [],
}))

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
    vertical: {
      isGrouped: false,
    },
  },
  storageKey: storageKey.value,
})
provide('statConfig', statConfig)

const statDate = useStatDate({
  initParams: {
    intervalsBy: calculateBestIntervalsBy(maxRange.value),
    intervalsDuration: 1,
    isShowMaxRange: true,
    isSkipEmpty: true,
    rangeBy: 'day',
    rangeDuration: differenceInDays(maxRange.value.end, maxRange.value.start),
  },
  key: storageKey.value,
  maxRange,
  queryParams: route.query,
})
provide('statDate', statDate)

onActivated(() => {
  statConfig.updateConfig('catsList', { isGrouped: false })
  statConfig.updateConfig('catsRound', { isGrouped: false })
  statConfig.updateConfig('vertical', { isGrouped: false })

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
      :config="{ isShowCategories: true }"
      :filter="{ isShow: true, isShowCategories: true }"
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
