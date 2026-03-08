/// <reference types="vite/client" />
import { beforeEach, vi } from 'vitest'

export let mockUserId: string | null = 'test-user-id'

export function setMockUser(userId: string | null) {
  mockUserId = userId
}

beforeEach(() => {
  mockUserId = 'test-user-id'
})

vi.mock('../auth', () => ({
  authComponent: {
    safeGetAuthUser: vi.fn(async () => {
      if (!mockUserId) return null
      return { _id: mockUserId }
    }),
  },
}))

export const modules = import.meta.glob('../**/*.ts')
