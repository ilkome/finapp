// @vitest-environment happy-dom
import { beforeEach, expect, it, vi } from 'vitest'

// The store is a module singleton, so each test loads a fresh module after setting storage.
async function useFeatures() {
  return (await import('./useFeatures')).useFeatures()
}

beforeEach(() => {
  localStorage.clear()
  vi.resetModules()
})

it('starts with every feature off', async () => {
  expect((await useFeatures()).value).toEqual({ emailSignIn: false, loans: false })
})

it('keeps a stored choice and backfills flags missing from it', async () => {
  localStorage.setItem('finapp.features', JSON.stringify({ emailSignIn: true }))
  expect((await useFeatures()).value).toEqual({ emailSignIn: true, loans: false })
})

it('shares one ref between calls', async () => {
  const { useFeatures } = await import('./useFeatures')
  expect(useFeatures()).toBe(useFeatures())
})
