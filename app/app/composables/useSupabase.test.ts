import { describe, expect, it, vi } from 'vitest'
import { computed, ref, shallowRef } from 'vue'

const authSignOut = vi.fn(async () => ({ error: null }))

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      getSession: async () => ({ data: { session: null } }),
      onAuthStateChange: () => {},
      signOut: authSignOut,
    },
  }),
}))

vi.stubGlobal('computed', computed)
vi.stubGlobal('ref', ref)
vi.stubGlobal('shallowRef', shallowRef)
vi.stubGlobal('useRuntimeConfig', () => ({ public: { supabaseAnonKey: 'anon', supabaseUrl: 'http://sb' } }))

const { useSupabaseAuth } = await import('~/composables/useSupabase')

describe('useSupabaseAuth.signOut', () => {
  it('signs out this device only, keeping other devices\' sessions alive', async () => {
    await useSupabaseAuth().signOut()
    expect(authSignOut).toHaveBeenCalledWith({ scope: 'local' })
  })
})
