/// <reference types="vite/client" />
import { beforeEach, vi } from 'vitest'

const state = { mockUserId: 'test-user-id' as string | null }

export function getMockUserId() {
  return state.mockUserId
}

export function setMockUser(userId: string | null) {
  state.mockUserId = userId
}

beforeEach(() => {
  state.mockUserId = 'test-user-id'
})

vi.mock('../auth', () => ({
  authComponent: {
    safeGetAuthUser: vi.fn(async () => {
      if (!state.mockUserId)
        return null
      return { _id: state.mockUserId }
    }),
  },
}))

export const modules = import.meta.glob('../**/*.ts')
