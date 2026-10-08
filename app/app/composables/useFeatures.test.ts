// @vitest-environment happy-dom
import { beforeEach, expect, it } from 'vitest'

import { useFeatures } from './useFeatures'

beforeEach(() => localStorage.clear())

it('starts with every feature off', () => {
  expect(useFeatures().value).toEqual({ emailSignIn: false, loans: false })
})

it('keeps a stored choice and backfills flags missing from it', () => {
  localStorage.setItem('finapp.features', JSON.stringify({ emailSignIn: true }))
  expect(useFeatures().value).toEqual({ emailSignIn: true, loans: false })
})
