import type { CategoryId } from '~/components/categories/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'

export function useCategoryContextMenu(options?: {
  onDelete?: (categoryId: CategoryId) => void
}) {
  const { t } = useI18n()
  const router = useRouter()
  const categoriesStore = useCategoriesStore()

  function getCategoryContextMenuItems(categoryId: CategoryId) {
    if (categoryId === 'transfer')
      return undefined

    const isChild = categoriesStore.items[categoryId]?.parentId !== 0

    const editGroup = [
      ...(isChild
        ? []
        : [{
            icon: 'lucide:square-arrow-out-up-right',
            label: t('base.open'),
            onSelect: () => router.push(`/categories/${categoryId}`),
          }]),
      {
        icon: 'lucide:pencil',
        label: t('base.edit'),
        onSelect: () => router.push(`/categories/${categoryId}/edit`),
      },
    ]

    if (!options?.onDelete)
      return [editGroup]

    return [editGroup, [{
      color: 'error' as const,
      icon: 'lucide:trash-2',
      label: t('base.delete'),
      onSelect: () => options.onDelete!(categoryId),
    }]]
  }

  return { getCategoryContextMenuItems }
}
