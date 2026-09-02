import type { Condition, ConditionGroup } from '~/components/stat/views/types'

export function useStatConditionTitles() {
  const { t } = useI18n()

  function conditionTitle(condition: Condition) {
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
