import type { CategoryId } from '~/components/categories/types'
import type { TrnId } from '~/components/trns/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { showErrorToast, showSuccessToast } from '~/composables/useStoreSync'

export function useCategoryDelete() {
  const { t } = useI18n()
  const categoriesStore = useCategoriesStore()
  const trnsStore = useTrnsStore()

  const deleteCategoryId = ref<CategoryId | null>(null)

  const deleteInfo = computed(() => {
    if (!deleteCategoryId.value)
      return { count: 0, descText: undefined as string | undefined, highlight: undefined as string | undefined }

    const count = trnsStore.getStoreTrnsIds({
      categoriesIds: categoriesStore.getChildrenIdsOrParent(deleteCategoryId.value),
    }).length
    return {
      count,
      descText: count > 0 ? t('categories.form.delete.alertWithTrns') : undefined,
      highlight: count > 0 ? t('trns.plural', count) : undefined,
    }
  })

  // A parent must be emptied of subcategories before it can be deleted.
  function requestDelete(categoryId: CategoryId) {
    for (const id of Object.keys(categoriesStore.items)) {
      if (categoriesStore.items[id]?.parentId === categoryId) {
        showErrorToast('categories.form.delete.errorChildren')
        return
      }
    }
    deleteCategoryId.value = categoryId
  }

  function cancelDelete() {
    deleteCategoryId.value = null
  }

  async function confirmDelete() {
    if (!deleteCategoryId.value)
      return

    const categoryId = deleteCategoryId.value
    const trnsIds: TrnId[] = [...trnsStore.getStoreTrnsIds({
      categoriesIds: categoriesStore.getChildrenIdsOrParent(categoryId),
    })]

    deleteCategoryId.value = null
    await categoriesStore.deleteCategory(categoryId, trnsIds)

    setTimeout(() => {
      showSuccessToast(trnsIds.length > 0
        ? 'categories.form.delete.okWithTrns'
        : 'categories.form.delete.okWithoutTrns', trnsIds.length > 0
        ? { length: trnsIds.length, trns: t('trns.plural', trnsIds.length) }
        : undefined)
    }, 300)
  }

  return {
    cancelDelete,
    confirmDelete,
    deleteCategoryId,
    deleteInfo,
    requestDelete,
  }
}
