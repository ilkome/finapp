<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { differenceInDays } from 'date-fns'

import type { CategoryId } from '~/components/categories/types'
import type { StatTabSlug } from '~/components/stat/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useStatDate } from '~/components/date/useStatDate'
import { calculateBestIntervalsBy } from '~/components/date/utils'
import { useFilter } from '~/components/stat/filter/useFilter'
import { filterKey, statConfigKey, statDateKey } from '~/components/stat/injectionKeys'
import { useStatConfig } from '~/components/stat/useStatConfig'
import { getTypesMapping } from '~/components/stat/utils'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { showErrorToast, showSuccessToast } from '~/composables/useStoreSync'

const { t } = useI18n()
const categoriesStore = useCategoriesStore()
const route = useRoute()
const router = useRouter()
const trnsFormStore = useTrnsFormStore()
const trnsStore = useTrnsStore()
const filter = useFilter()

provide(filterKey, filter)

const categoryId = computed(() => route.params.id) as ComputedRef<CategoryId>
const category = computed(() => categoriesStore.items[categoryId.value])
const preCategoriesIds = computed(() => categoriesStore.getChildsIds(categoryId.value))
const categoriesIdsOrParent = computed(() => categoriesStore.getChildsIdsOrParent(categoryId.value))

const activeTab = useStorage<StatTabSlug>(`page-${categoryId.value}-tab`, 'summary')
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
provide(statConfigKey, statConfig)

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
provide(statDateKey, statDate)

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

const deleteDescText = computed(() => {
  if (trnsIds.value && trnsIds.value.length > 0)
    return t('categories.form.delete.alertWithTrns', { trns: t('trns.plural', trnsIds.value.length) })
  return undefined
})

const isShowDeleteConfirm = ref(false)
function onClickDelete(close: () => void) {
  close()

  for (const id in categoriesStore.items) {
    if (categoriesStore.items[id]?.parentId === categoryId.value) {
      showErrorToast('categories.form.delete.errorChilds')

      return false
    }
  }

  isShowDeleteConfirm.value = true
}

async function onDeleteConfirm() {
  const trnsIdsS = [...trnsStore.getStoreTrnsIds({
    categoriesIds: categoriesStore.getChildsIdsOrParent(categoryId.value),
  })]

  router.push('/categories')
  await categoriesStore.deleteCategory(categoryId.value, trnsIdsS)

  // Give some time to complete redirect
  setTimeout(() => {
    showSuccessToast(trnsIdsS?.length > 0
      ? 'categories.form.delete.okWithTrns'
      : 'categories.form.delete.okWithoutTrns', trnsIdsS?.length > 0
      ? { length: trnsIdsS.length, trns: t('trns.plural', trnsIdsS.length) }
      : undefined)
  }, 300)
}

const categoriesIds = computed(() => categoriesStore.getChildsIds(categoryId.value))
</script>

<template>
  <UiPage v-if="category">
    <StatHeader
      :config="{
        isShowCategories: true,
      }"
      :filter="{
        isShow: true,
        isShowWallets: true,
      }"
    >
      <template #title>
        <CategoriesHeader
          :category="category"
          :parentCategory="categoriesStore.items[category.parentId]"
        />
      </template>

      <template #selected>
        <StatMenu
          :active="activeTab"
          @click="(id: StatTabSlug) => activeTab = id"
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

        <UiHeaderLink
          icon="mdi:delete-empty-outline"
          @click="onClickDelete(close)"
        >
          {{ t('base.delete') }}
        </UiHeaderLink>
      </template>
    </StatHeader>

    <LayoutConfirmModal
      v-if="isShowDeleteConfirm"
      :description="deleteDescText"
      @closed="isShowDeleteConfirm = false"
      @confirm="onDeleteConfirm"
    />

    <div
      class="grow px-2 lg:px-4 2xl:px-8"
    >
      <CategoriesList
        :ids="categoriesIds"
        :categoriesItemProps="{
          class: 'group',
        }"
        @click="(categoryId: CategoryId) => router.push(`/categories/${categoryId}`)"
      />
    </div>

    <StatWrap
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
