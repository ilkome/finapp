import type { CategoryWithData } from '~/components/stat/types'

export function sortCategoriesByAmount(a: CategoryWithData, b: CategoryWithData) {
  console.log('sort')

  if (!a || !b)
    return 0

  const isP = a.value >= 0 && b.value >= 0
  const isN = a.value < 0 && b.value < 0

  if (isP)
    return b.value - a.value
  if (isN)
    return a.value - b.value
  return a.value >= 0 ? -1 : 1
}
