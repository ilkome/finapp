export type CategoryID = string

export interface CategoryItem {
  name: string
  color: string
  parentId?: CategoryID
  childIds?: CategoryID[]
}

export interface CategoryStore {
  items: Record<CategoryID, CategoryItem>
}
