export function getCatsIds(catsIds, catsItems) {
  const ids = []

  for (const catId of catsIds) {
    const category = catsItems[catId]
    category?.childIds
      ? ids.push(...category.childIds)
      : ids.push(catId)
  }

  return ids
}
