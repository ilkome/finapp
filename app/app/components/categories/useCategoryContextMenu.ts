import type { CategoryId } from '~/components/categories/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'

export function useCategoryContextMenu(options?: {
  excludeOpen?: boolean
  onDelete?: (categoryId: CategoryId) => void
  onEdit?: (categoryId: CategoryId) => void
  returnBackOnSave?: boolean
  withQuickToggles?: boolean
}) {
  const { t } = useI18n()
  const router = useRouter()
  const categoriesStore = useCategoriesStore()

  function toggleFlag(categoryId: CategoryId, key: 'showInLastUsed' | 'showInQuickSelector') {
    const cat = categoriesStore.items[categoryId]
    if (!cat)
      return
    categoriesStore.saveCategory({
      id: categoryId,
      isUpdateChildCategoriesColor: false,
      values: { ...cat, [key]: !cat[key] },
    })
  }

  function getCategoryContextMenuItems(categoryId: CategoryId) {
    if (categoryId === 'transfer' || categoryId === 'adjustment')
      return undefined

    const cat = categoriesStore.items[categoryId]
    if (!cat)
      return undefined

    const isChild = cat.parentId !== 0
    const hasChildren = categoriesStore.hasChildren(categoryId)
    const editPath = options?.returnBackOnSave
      ? `/categories/${categoryId}/edit?returnBack=1`
      : `/categories/${categoryId}/edit`

    const editGroup = [
      ...(!options?.excludeOpen && !isChild
        ? [{
            icon: 'lucide:square-arrow-out-up-right',
            label: t('base.open'),
            onSelect: () => router.push(`/categories/${categoryId}`),
          }]
        : []),
      {
        icon: 'lucide:pencil',
        label: t('base.edit'),
        onSelect: () => options?.onEdit
          ? options.onEdit(categoryId)
          : router.push(editPath),
      },
    ]

    const groups: any[][] = [editGroup]

    // Quick toggles only for leaf categories (those selectable in trnForm).
    // Recent toggle is hidden when category is already a favorite — favorites
    // supersede recents in the UI, so the recent flag is moot.
    if (options?.withQuickToggles && !hasChildren) {
      const toggles: any[] = [{
        icon: 'lucide:star',
        label: cat.showInQuickSelector
          ? t('categories.actions.removeFromFavorites')
          : t('categories.actions.addToFavorites'),
        onSelect: () => toggleFlag(categoryId, 'showInQuickSelector'),
      }]

      if (!cat.showInQuickSelector) {
        toggles.push({
          icon: 'lucide:clock',
          label: cat.showInLastUsed
            ? t('categories.actions.removeFromRecent')
            : t('categories.actions.addToRecent'),
          onSelect: () => toggleFlag(categoryId, 'showInLastUsed'),
        })
      }

      groups.push(toggles)
    }

    if (options?.onDelete) {
      groups.push([{
        color: 'error' as const,
        icon: 'lucide:trash-2',
        label: t('base.delete'),
        onSelect: () => options.onDelete!(categoryId),
      }])
    }

    return groups
  }

  return { getCategoryContextMenuItems }
}
