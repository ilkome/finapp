import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import DateRowView from '~/components/trns/DateRowView.vue'

const props = { currencyCode: 'USD', date: 1789084800000, isShowGroupSum: true, sum: { expense: 152, income: 3000 } }

describe('trnsDateRowView', () => {
  it('renders the day and both totals, and forwards the header click', async () => {
    const wrapper = mount(DateRowView, { props })
    expect(wrapper.findAll('[data-amount]').map(el => el.text())).toEqual(['3000 USD', '152 USD'])
    await wrapper.find('.grow').trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('shows no sum for a single-transaction day or when sums are off', () => {
    expect(mount(DateRowView, { props: { ...props, sum: undefined } }).findAll('[data-amount]')).toHaveLength(0)
    expect(mount(DateRowView, { props: { ...props, isShowGroupSum: false } }).findAll('[data-amount]')).toHaveLength(0)
  })
})
