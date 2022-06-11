export type CategoryID = string

export interface CategoryItem {
  color: string
  icon: string
  name: string
  parentId: CategoryID | 0
  childIds?: CategoryID[]
}

export interface CategoryStore {
  items: Record<CategoryID, CategoryItem>
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
