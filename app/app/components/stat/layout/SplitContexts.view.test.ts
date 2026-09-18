import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import SplitContexts from '~/components/stat/layout/SplitContexts'

describe('statSplitContexts', () => {
  it('builds the pair on mount and reports disposal on unmount', () => {
    const create = vi.fn((type: 'expense' | 'income') => ({ type }))
    const wrapper = mount(SplitContexts, { props: { create: create as any } })

    expect(create.mock.calls.map(([type]) => type)).toEqual(['expense', 'income'])
    expect(wrapper.emitted('ready')?.[0]?.[0]).toEqual({ expense: { type: 'expense' }, income: { type: 'income' } })

    wrapper.unmount()
    expect(wrapper.emitted('dispose')).toHaveLength(1)
  })
})
