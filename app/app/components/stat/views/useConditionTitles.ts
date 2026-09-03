import type { Condition, ConditionGroup } from '~/components/stat/views/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

export function useStatConditionTitles() {
  const { t } = useI18n()
  const categoriesStore = useCategoriesStore()
  const walletsStore = useWalletsStore()

  function selectionTitle(condition: Extract<Condition, { kind: 'categorySelection' | 'walletSelection' }>) {
    const entity = condition.kind === 'walletSelection' ? 'wallet' : 'category'
    const field = t(`stat.views.conditions.fields.${condition.kind}`)
    if (condition.mode !== 'selected')
      return t('stat.views.blockRules.conditionSummary.selection', { field, value: t(`stat.views.conditions.selection.${entity}.${condition.mode}`) })
    const names = condition.ids.map(id => condition.kind === 'walletSelection'
      ? walletsStore.itemsComputed[id]?.name
      : categoriesStore.items[id]?.name).filter((name): name is string => !!name)
    const value = names.length <= 2 ? names.join(', ') : t('stat.views.conditions.selection.multiple', { count: names.length })
    return t('stat.views.blockRules.conditionSummary.selection', { field, value })
  }

  function conditionTitle(condition: Condition) {
    if (condition.kind === 'walletSelection' || condition.kind === 'categorySelection')
      return selectionTitle(condition)
    const comparator = condition.comparator
    if (condition.kind === 'categoryCount') {
      const field = condition.scope === 'parent'
        ? t('stat.views.conditions.fields.parentCategoryCount')
        : t('stat.views.conditions.fields.allCategoryCount')
      return t('stat.views.blockRules.conditionSummary.categoryCount', { comparator, field, value: condition.value })
    }
    if (condition.kind === 'contentWidth')
      return t('stat.views.blockRules.conditionSummary.contentWidth', { comparator, value: condition.value })
    return t('stat.views.blockRules.conditionSummary.period', {
      comparator,
      unit: t(`stat.views.conditions.units.${condition.unit}`).toLocaleLowerCase(),
      value: condition.value,
    })
  }

  function flattenConditions(group: ConditionGroup, result: Condition[] = []): Condition[] {
    for (const child of group.children) {
      if ('children' in child)
        flattenConditions(child, result)
      else
        result.push(child)
    }
    return result
  }

  function conditionGroupTitle(group: ConditionGroup) {
    const conditions = flattenConditions(group)
    return conditions.length
      ? conditions.map(conditionTitle).join(', ')
      : t('stat.views.blockRules.new')
  }

  return { conditionGroupTitle, conditionTitle }
}
