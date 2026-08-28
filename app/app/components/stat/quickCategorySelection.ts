import type { CategoryId } from '~/components/categories/types'
import type { StatReportType } from '~/components/stat/types'

export function resolveQuickCategorySelection(options: {
  categoryId: CategoryId
  hasExpense: boolean
  hasIncome: boolean
  isSelected: boolean
}): Record<StatReportType, CategoryId[]> {
  if (options.isSelected) {
    return {
      combined: [],
      expense: [],
      income: [],
    }
  }

  return {
    combined: [options.categoryId],
    expense: options.hasExpense ? [options.categoryId] : [],
    income: options.hasIncome ? [options.categoryId] : [],
  }
}
