export type CategoryId = string | 'transfer'

export interface CategoryItem {
  color: string
  icon: string
  name: string
  order: number
  showStat?: boolean
  parentId: CategoryId | 0
  childIds?: CategoryId[]
  showInLastUsed: boolean
  showInQuickSelector: boolean
}

export type Categories = Record<CategoryId, CategoryItem> & Record<'transfer', CategoryItem>

export interface CategoryForm {
  color: string
  icon: string
  name: string
  order: number
  parentId: string | 0
  showInLastUsed: boolean
  showInQuickSelector: boolean
  showStat: boolean
}
