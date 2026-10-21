/** The first `budget` rows of the period groups, in order. A cut group keeps the sum of the whole period. */
export function takeGroupRows<G extends { ids: readonly unknown[] }>(groups: readonly G[], budget: number): G[] {
  const out: G[] = []
  let left = budget
  for (const group of groups) {
    if (left <= 0)
      break
    out.push(group.ids.length <= left ? group : { ...group, ids: group.ids.slice(0, left) })
    left -= group.ids.length
  }
  return out
}
