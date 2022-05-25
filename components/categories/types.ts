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
