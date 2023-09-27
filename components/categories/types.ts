export type CategoryId = string

export interface CategoryItem {
  color: string
  icon: string
  name: string
  parentId: CategoryId | 0
  childIds?: CategoryId[]
  showInLastUsed: boolean
  showInQuickSelector: boolean
}

export interface CategoryStore {
  items: Record<CategoryId, CategoryItem>
}

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

export type Categories = Record<CategoryId, CategoryItem>
