import type { CategoryId } from '~/components/categories/types'
import type { TrnId } from '~/components/trns/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { showErrorToast, showSuccessToast } from '~/composables/useStoreSync'

export function useCategoryDelete() {
  const { t } = useI18n()
  const categoriesStore = useCategoriesStore()
  const trnsStore = useTrnsStore()

  const confirm = useConfirm()

  // A parent must be emptied of subcategories before it can be deleted.
  async function requestDelete(categoryId: CategoryId) {
    for (const id of Object.keys(categoriesStore.items)) {
      if (categoriesStore.items[id]?.parentId === categoryId) {
        showErrorToast('categories.form.delete.errorChildren')
        return
      }
    }

    const trnsIds: TrnId[] = [...trnsStore.getStoreTrnsIds({
      categoriesIds: categoriesStore.getChildrenIdsOrParent(categoryId),
    })]
    const count = trnsIds.length
    const confirmed = await confirm.ask({
      description: count > 0 ? t('categories.form.delete.alertWithTrns') : undefined,
      highlight: count > 0 ? t('trns.plural', count) : undefined,
      title: t('categories.form.delete.title'),
    })
    if (!confirmed)
      return

    await categoriesStore.deleteCategory(categoryId, trnsIds)

    setTimeout(() => {
      showSuccessToast(count > 0
        ? 'categories.form.delete.okWithTrns'
        : 'categories.form.delete.okWithoutTrns', count > 0
        ? { length: count, trns: t('trns.plural', count) }
        : undefined)
    }, 300)
  }

  return { requestDelete }
}
