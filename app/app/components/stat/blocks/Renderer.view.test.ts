import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import StatBlocksRenderer from '~/components/stat/blocks/Renderer.vue'
import sums from '~/components/stat/fixtures/sums.json'

describe('statBlocksRenderer', () => {
  it('mounts a sums block from a payload', () => {
    const wrapper = mount(StatBlocksRenderer, { props: { block: { props: sums, type: 'sums' } } })
    expect(wrapper.findAll('[data-amount]')).toHaveLength(6)
    expect(wrapper.find('[data-stat-block-error]').exists()).toBe(false)
  })

  it('shows the validation error instead of a broken block', () => {
    const wrapper = mount(StatBlocksRenderer, { props: { block: { props: { items: 'x' }, type: 'sums' } } })
    expect(wrapper.find('[data-stat-block-error]').text()).toContain('props.currencyCode')
  })
})
