import type { CategoryId } from '~/components/categories/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'

type Item = { color?: 'error', icon: string, label: string, onSelect: () => void }

export function isMenuableCategory(categoryId: CategoryId): boolean {
  return categoryId !== 'transfer' && categoryId !== 'adjustment'
}

export function useCategoryMenuItems() {
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

  return {
    delete(categoryId: CategoryId, onDelete: (id: CategoryId) => void): Item {
      return {
        color: 'error',
        icon: 'lucide:trash-2',
        label: t('base.delete'),
        onSelect: () => onDelete(categoryId),
      }
    },

    edit(categoryId: CategoryId, opts?: { onEdit?: (id: CategoryId) => void, returnBack?: boolean }): Item {
      return {
        icon: 'lucide:pencil',
        label: t('base.edit'),
        onSelect: () => opts?.onEdit
          ? opts.onEdit(categoryId)
          : router.push(opts?.returnBack
              ? `/categories/${categoryId}/edit?returnBack=1`
              : `/categories/${categoryId}/edit`),
      }
    },

    // Open is only meaningful for root categories (subcategories don't have detail pages).
    open(categoryId: CategoryId): Item | null {
      const cat = categoriesStore.items[categoryId]
      if (!cat || cat.parentId !== 0)
        return null
      return {
        icon: 'lucide:square-arrow-out-up-right',
        label: t('base.open'),
        onSelect: () => router.push(`/categories/${categoryId}`),
      }
    },

    // Favorite/recent toggles - leaf categories only. Recent is hidden when
    // already a favorite (favorites supersede recents in the UI).
    quickToggles(categoryId: CategoryId): Item[] | null {
      const cat = categoriesStore.items[categoryId]
      if (!cat || categoriesStore.hasChildren(categoryId))
        return null

      const items: Item[] = [{
        icon: 'lucide:star',
        label: cat.showInQuickSelector
          ? t('categories.actions.removeFromFavorites')
          : t('categories.actions.addToFavorites'),
        onSelect: () => toggleFlag(categoryId, 'showInQuickSelector'),
      }]

      if (!cat.showInQuickSelector) {
        items.push({
          icon: 'lucide:clock',
          label: cat.showInLastUsed
            ? t('categories.actions.removeFromRecent')
            : t('categories.actions.addToRecent'),
          onSelect: () => toggleFlag(categoryId, 'showInLastUsed'),
        })
      }

      return items
    },
  }
}
