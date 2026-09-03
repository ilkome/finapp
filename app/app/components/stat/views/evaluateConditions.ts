import { addDays, addMonths, addWeeks, addYears, differenceInCalendarDays } from 'date-fns'

import type { Condition, ConditionComparator, ConditionGroup, StatView, StatViewContext } from './types'

import { compareCondition } from './conditions'

function matchesPeriod(range: StatViewContext['range'], unit: 'day' | 'week' | 'month' | 'year', value: number): boolean {
  const start = new Date(range.start)
  const end = new Date(range.end)
  if (unit === 'day')
    return differenceInCalendarDays(end, start) + 1 === value
  const add = unit === 'week' ? addWeeks : unit === 'month' ? addMonths : addYears
  return add(start, value).getTime() > end.getTime() && add(start, value - 1).getTime() <= end.getTime()
}

function comparePeriod(range: StatViewContext['range'], unit: 'day' | 'week' | 'month' | 'year', comparator: ConditionComparator, value: number): boolean {
  if (comparator === '=')
    return matchesPeriod(range, unit, value)
  if (comparator === '!=')
    return !matchesPeriod(range, unit, value)
  const add = unit === 'day' ? addDays : unit === 'week' ? addWeeks : unit === 'month' ? addMonths : addYears
  const start = new Date(range.start)
  const end = new Date(range.end)
  if (comparator === '<')
    return add(start, Math.max(0, value - 1)).getTime() > end.getTime()
  if (comparator === '<=')
    return add(start, value).getTime() > end.getTime()
  if (comparator === '>')
    return add(start, value).getTime() <= end.getTime()
  return add(start, Math.max(0, value - 1)).getTime() <= end.getTime()
}

export function evaluateCondition(condition: Condition, context: StatViewContext): boolean {
  if (condition.kind === 'walletSelection') {
    if (condition.mode === 'all')
      return true
    if (condition.mode === 'none')
      return context.selectedWalletIds.length === 0
    const selectedIds = new Set(context.selectedWalletIds)
    return condition.ids.some(id => selectedIds.has(id))
  }

  if (condition.kind === 'categorySelection') {
    if (condition.mode === 'all')
      return true
    if (condition.mode === 'none')
      return context.selectedCategoryIds.length === 0
    const matchingIds = new Set(condition.ids)
    return context.selectedCategoryIds.some(id => (context.categoryPathById[id] ?? [id]).some(pathId => matchingIds.has(pathId)))
  }

  if (condition.kind === 'contentWidth')
    return context.contentWidth !== null && compareCondition(context.contentWidth, condition.comparator, condition.value)

  const actual = condition.kind === 'categoryCount'
    ? condition.scope === 'parent' ? context.parentCategoryCount : context.categoryCount
    : 0
  if (condition.kind === 'categoryCount')
    return compareCondition(actual, condition.comparator, condition.value)
  return comparePeriod(context.range, condition.unit, condition.comparator, condition.value)
}

export function evaluateConditionGroup(group: ConditionGroup, context: StatViewContext): boolean {
  return group.operator === 'and'
    ? group.children.every(child => 'children' in child ? evaluateConditionGroup(child, context) : evaluateCondition(child, context))
    : group.children.some(child => 'children' in child ? evaluateConditionGroup(child, context) : evaluateCondition(child, context))
}

export function findAutomaticView(views: StatView[], context: StatViewContext): StatView | null {
  return views
    .toSorted((a, b) => a.sortOrder - b.sortOrder)
    .find(view => view.isAutoEnabled && view.autoRule && evaluateConditionGroup(view.autoRule, context)) ?? null
}

export function contextFingerprint(context: StatViewContext): string {
  const selectedCategoryPaths = context.selectedCategoryIds
    .map(id => context.categoryPathById[id] ?? [id])
    .map(path => [...path].sort())
    .toSorted((a, b) => a.join('\0').localeCompare(b.join('\0')))
  return JSON.stringify([context.range.start, context.range.end, selectedCategoryPaths, [...context.selectedWalletIds].sort(), context.categoryCount, context.parentCategoryCount, context.contentWidth])
}
