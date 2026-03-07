import type { CategoryId } from '~/components/categories/types'

export function useCategoryContextMenu(options?: {
  onDelete?: (categoryId: CategoryId) => void
}) {
  const { t } = useI18n()
  const router = useRouter()

  function getCategoryContextMenuItems(categoryId: CategoryId) {
    if (categoryId === 'transfer')
      return undefined

    const editGroup = [{
      icon: 'lucide:pencil',
      label: t('base.edit'),
      onSelect: () => router.push(`/categories/${categoryId}/edit`),
    }]

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
