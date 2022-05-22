export type CategoryID = string

export interface CategoryItem {
  name: string
  color: string
  parentId: CategoryID | 0
  childIds?: CategoryID[]
}

export interface CategoryStore {
  items: Record<CategoryID, CategoryItem>
}
