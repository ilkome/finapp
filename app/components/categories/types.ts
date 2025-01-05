export type CategoryId = string | 'transfer'

export type CategoryItem = {
  childIds?: CategoryId[]
  color: string
  editedAt?: number
  icon: string
  name: string
  order?: number
  parentId: CategoryId | 0
  showInLastUsed?: boolean
  showInQuickSelector?: boolean
}

export type CategoryItemWithId = CategoryItem & {
  id: CategoryId
}

export type Categories = Record<CategoryId, CategoryItem> & Record<'transfer', CategoryItem>

export type CategoryForm = {
  color: string
  icon: string
  name: string
  order: number
  parentId: string | 0
  showInLastUsed: boolean
  showInQuickSelector: boolean
}

export type AddCategoryParams = {
  id: CategoryId
  values: CategoryItem
} & {
  childIds?: CategoryId[]
  isUpdateChildCategoriesColor: boolean
}
