<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { differenceInDays } from 'date-fns'

import type { CategoryId } from '~/components/categories/types'
import type { StatTabSlug } from '~/components/stat/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCategoryContextMenu } from '~/components/categories/useCategoryContextMenu'
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
const deleteChildId = ref<CategoryId | null>(null)

const deleteChildTrnsCount = computed(() => {
  if (!deleteChildId.value)
    return 0
  return trnsStore.getStoreTrnsIds({
    categoriesIds: categoriesStore.getChildrenIdsOrParent(deleteChildId.value),
  }).length
})

const deleteChildDescText = computed(() =>
  deleteChildTrnsCount.value > 0 ? t('categories.form.delete.alertWithTrns') : undefined,
)

const deleteChildHighlight = computed(() =>
  deleteChildTrnsCount.value > 0 ? t('trns.plural', deleteChildTrnsCount.value) : undefined,
)

function onClickDeleteChild(childCategoryId: CategoryId) {
  deleteChildId.value = childCategoryId
}

async function onDeleteChildConfirm() {
  if (!deleteChildId.value)
    return

  const childId = deleteChildId.value
  const childTrnsIds = [...trnsStore.getStoreTrnsIds({
    categoriesIds: categoriesStore.getChildrenIdsOrParent(childId),
  })]

  deleteChildId.value = null
  await categoriesStore.deleteCategory(childId, childTrnsIds)

  setTimeout(() => {
    showSuccessToast(childTrnsIds.length > 0
      ? 'categories.form.delete.okWithTrns'
      : 'categories.form.delete.okWithoutTrns', childTrnsIds.length > 0
      ? { length: childTrnsIds.length, trns: t('trns.plural', childTrnsIds.length) }
      : undefined)
  }, 300)
}

const { getCategoryContextMenuItems } = useCategoryContextMenu({
  onDelete: childCategoryId => onClickDeleteChild(childCategoryId),
})

provide(filterKey, filter)

const categoryId = computed(() => route.params.id) as ComputedRef<CategoryId>
const category = computed(() => categoriesStore.items[categoryId.value])
const preCategoriesIds = computed(() => categoriesStore.getChildrenIds(categoryId.value))
const categoriesIdsOrParent = computed(() => categoriesStore.getChildrenIdsOrParent(categoryId.value))

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

  if (categoriesStore.isTransactible(categoryId.value))
    trnsFormStore.values.categoryId = categoryId.value
})

function onEditClick(close: () => void) {
  close()
  setTimeout(() => {
    router.push(`/categories/${categoryId.value}/edit`)
  }, 100)
}

useHead({ title: category.value?.name })

const deleteDescText = computed(() =>
  trnsIds.value.length > 0 ? t('categories.form.delete.alertWithTrns') : undefined,
)

const deleteHighlight = computed(() =>
  trnsIds.value.length > 0 ? t('trns.plural', trnsIds.value.length) : undefined,
)

const isShowDeleteConfirm = ref(false)
function onClickDelete(close: () => void) {
  close()

  for (const id of Object.keys(categoriesStore.items)) {
    if (categoriesStore.items[id]?.parentId === categoryId.value) {
      showErrorToast('categories.form.delete.errorChildren')

      return
    }
  }

  isShowDeleteConfirm.value = true
}

async function onDeleteConfirm() {
  const deleteTrnsIds = [...trnsStore.getStoreTrnsIds({
    categoriesIds: categoriesStore.getChildrenIdsOrParent(categoryId.value),
  })]

  router.push('/categories')
  await categoriesStore.deleteCategory(categoryId.value, deleteTrnsIds)

  // Give some time to complete redirect
  setTimeout(() => {
    showSuccessToast(deleteTrnsIds.length > 0
      ? 'categories.form.delete.okWithTrns'
      : 'categories.form.delete.okWithoutTrns', deleteTrnsIds.length > 0
      ? { length: deleteTrnsIds.length, trns: t('trns.plural', deleteTrnsIds.length) }
      : undefined)
  }, 300)
}

const categoriesIds = computed(() => categoriesStore.getChildrenIds(categoryId.value))
</script>

<template>
  <UiPage v-if="category">
    <StatHeader
      v-model:activeTab="activeTab"
      filterWallets
    >
      <template #title>
        <CategoriesHeader
          :category="category"
          :parentCategory="categoriesStore.items[category.parentId]"
        />
      </template>

      <template
        v-if="categoryId !== 'transfer'"
        #popover="{ close }"
      >
        <UiHeaderLink
          icon="lucide:pencil"
          @click="onEditClick(close)"
        >
          {{ t('base.edit') }}
        </UiHeaderLink>

        <UiHeaderLink
          icon="lucide:trash-2"
          @click="onClickDelete(close)"
        >
          {{ t('base.delete') }}
        </UiHeaderLink>
      </template>
    </StatHeader>

    <LayoutConfirmModal
      v-if="isShowDeleteConfirm"
      :title="t('categories.form.delete.title')"
      :description="deleteDescText"
      :highlight="deleteHighlight"
      @closed="isShowDeleteConfirm = false"
      @confirm="onDeleteConfirm"
    />

    <LayoutConfirmModal
      v-if="deleteChildId"
      :title="t('categories.form.delete.title')"
      :description="deleteChildDescText"
      :highlight="deleteChildHighlight"
      @closed="deleteChildId = null"
      @confirm="onDeleteChildConfirm"
    />

    <div
      class="grow px-2 lg:px-4 2xl:px-8"
    >
      <CategoriesList
        :ids="categoriesIds"
        :categoriesItemProps="{
          class: 'group',
        }"
        :getContextMenuItems="getCategoryContextMenuItems"
        :getTo="(categoryId: CategoryId) => `/categories/${categoryId}`"
      />
    </div>

    <StatWrap
      :activeTab
      :categoryId
      :hasChildren="categoriesIdsOrParent.length > 1"
      :preCategoriesIds
      :range="statDate.range.value"
      :storageKey
      :trnsIds
    />
  </UiPage>
</template>
