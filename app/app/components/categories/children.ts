import type { Categories, CategoryId } from '~/components/categories/types'

import { isReservedCategoryId } from '~/components/categories/utils'

export type CandidateGroup = 'current' | 'freeRoot' | 'fromOther'
export type CandidateGroups = Record<CandidateGroup, CategoryId[]>

export const candidateGroupOrder: CandidateGroup[] = ['current', 'freeRoot', 'fromOther']

/**
 * Categories that `editId` may adopt as children, grouped and sorted by name:
 * its current children, roots without children of their own, and children of other roots (reparented).
 */
export function childCandidateGroups(items: Categories, editId: CategoryId, currentChildIds: CategoryId[]): CandidateGroups {
  const rootsWithChildren = new Set(Object.values(items).map(item => item.parentId).filter((id): id is CategoryId => typeof id === 'string' && !!id))
  const groups: CandidateGroups = { current: [], freeRoot: [], fromOther: [] }
  for (const [id, item] of Object.entries(items)) {
    if (isReservedCategoryId(id) || id === editId)
      continue
    if (item.parentId === editId || currentChildIds.includes(id))
      groups.current.push(id)
    else if (item.parentId !== 0)
      groups.fromOther.push(id)
    else if (!rootsWithChildren.has(id))
      groups.freeRoot.push(id)
  }
  const byName = (a: CategoryId, b: CategoryId) => (items[a]?.name ?? '').localeCompare(items[b]?.name ?? '')
  for (const group of candidateGroupOrder)
    groups[group].sort(byName)
  return groups
}

export function candidatesCount(groups: CandidateGroups): number {
  return candidateGroupOrder.reduce((count, group) => count + groups[group].length, 0)
}

/** Keeps candidates whose name or parent's name contains the query, case-insensitive. */
export function filterCandidateGroups(groups: CandidateGroups, items: Categories, query: string): CandidateGroups {
  const q = query.trim().toLowerCase()
  if (!q)
    return groups
  const match = (id: CategoryId) => {
    const item = items[id]
    const parentName = typeof item?.parentId === 'string' ? items[item.parentId]?.name ?? '' : ''
    return !!item && (item.name.toLowerCase().includes(q) || parentName.toLowerCase().includes(q))
  }
  return { current: groups.current.filter(match), freeRoot: groups.freeRoot.filter(match), fromOther: groups.fromOther.filter(match) }
}

/** Two children of one parent may not share a name. */
export function hasDuplicateNames(items: Categories, ids: CategoryId[]): boolean {
  const names = ids.flatMap(id => items[id]?.name ?? [])
  return new Set(names).size !== names.length
}

/** Another category under the same parent already has this name. */
export function isNameTaken(items: Categories, name: string, parentId: CategoryId | 0, exceptId: CategoryId): boolean {
  return Object.entries(items).some(([id, item]) => id !== exceptId && item.name === name && item.parentId === parentId)
}
