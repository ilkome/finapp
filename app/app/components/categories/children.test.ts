import { describe, expect, it } from 'vitest'

import type { Categories } from '~/components/categories/types'

import { childCandidateGroups, filterCandidateGroups, hasDuplicateNames, isNameTaken } from '~/components/categories/children'

const cat = (name: string, parentId: string | 0 = 0) => ({ color: '', icon: '', name, parentId, showInLastUsed: true, showInQuickSelector: false }) as unknown as Categories[string]

const items: Categories = {
  edit: cat('Food'),
  free: cat('Taxi'),
  kid: cat('Snacks', 'edit'),
  loan_interest: cat('Interest'),
  other: cat('Rent', 'parent'),
  parent: cat('Home'),
}

describe('childCandidateGroups', () => {
  it('groups own children, free roots and children of other roots; skips roots with children, itself and reserved ids', () => {
    expect(childCandidateGroups(items, 'edit', ['kid'])).toEqual({ current: ['kid'], freeRoot: ['free'], fromOther: ['other'] })
  })

  it('filters by the category or its parent name', () => {
    const groups = childCandidateGroups(items, 'edit', ['kid'])
    expect(filterCandidateGroups(groups, items, 'home')).toEqual({ current: [], freeRoot: [], fromOther: ['other'] })
  })
})

describe('name rules', () => {
  it('finds a sibling with the same name, ignoring the edited one', () => {
    expect(isNameTaken(items, 'Rent', 'parent', 'new')).toBe(true)
    expect(isNameTaken(items, 'Rent', 'parent', 'other')).toBe(false)
    expect(isNameTaken(items, 'Rent', 0, 'new')).toBe(false)
  })

  it('flags children that share a name', () => {
    expect(hasDuplicateNames({ ...items, dup: cat('Taxi', 'x') }, ['free', 'dup'])).toBe(true)
    expect(hasDuplicateNames(items, ['free', 'other'])).toBe(false)
  })
})
