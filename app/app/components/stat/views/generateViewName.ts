import type { Condition, ConditionGroup } from './types'

export type ViewNameLabels = {
  and: string
  andMore: (count: number) => string
  categoryCount: (scope: 'all' | 'parent', comparator: string, value: number) => string
  categorySelection: (mode: 'all' | 'none' | 'selected', ids: string[]) => string
  contentWidth: (comparator: string, value: number) => string
  fallback: string
  period: (value: number, unit: string) => string
  walletSelection: (mode: 'all' | 'none' | 'selected', ids: string[]) => string
}

function flatten(group: ConditionGroup, result: Condition[] = []): Condition[] {
  for (const child of group.children) {
    if ('children' in child)
      flatten(child, result)
    else
      result.push(child)
  }
  return result
}

export function generateViewName(rule: ConditionGroup | null, labels: ViewNameLabels, existing: string[] = []): string {
  const parts = rule
    ? flatten(rule).map((condition) => {
        if (condition.kind === 'period')
          return labels.period(condition.value, condition.unit)
        if (condition.kind === 'contentWidth')
          return labels.contentWidth(condition.comparator, condition.value)
        if (condition.kind === 'walletSelection')
          return labels.walletSelection(condition.mode, condition.ids)
        if (condition.kind === 'categorySelection')
          return labels.categorySelection(condition.mode, condition.ids)
        return labels.categoryCount(condition.scope, condition.comparator, condition.value)
      }).filter(Boolean)
    : []
  const base = parts.length ? [...parts.slice(0, 2), ...(parts.length > 2 ? [labels.andMore(parts.length - 2)] : [])].join(` ${labels.and} `) : labels.fallback
  const used = new Set(existing.map(name => name.toLocaleLowerCase()))
  if (!used.has(base.toLocaleLowerCase()))
    return base
  let suffix = 2
  while (used.has(`${base} ${suffix}`.toLocaleLowerCase())) suffix++
  return `${base} ${suffix}`
}
