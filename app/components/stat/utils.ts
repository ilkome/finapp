import type { TotalCategory } from '~/components/stat/types'

export function sortCategoriesByAmount(a: TotalCategory, b: TotalCategory) {
  if (!a || !b)
    return 0

  // Sort positive values from biggest to smallest
  if (a.value >= 0 && b.value >= 0) {
    return b.value - a.value
  }
  // Sort negative values from smallest to biggest
  else if (a.value < 0 && b.value < 0) {
    return a.value - b.value
  }
  // Keep positive values before negative values
  else if (a.value >= 0 && b.value < 0) {
    return -1
  }
  // Keep negative values after positive values
  else {
    return 1
  }
}
