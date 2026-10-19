import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import upcoming from '~/components/demo/loans/upcoming.json'
import LoansUpcomingView from '~/components/loans/UpcomingView.vue'

// The real collapsible mounts its content lazily; this stub renders it whenever `open` is true.
const stubs = { UCollapsible: { props: ['open'], template: '<div><slot /><div v-if="open"><slot name="content" /></div></div>' } }

describe('loansUpcomingView', () => {
  it('renders the total, the groups in order and a day sum only for a multi-charge day', () => {
    const wrapper = mount(LoansUpcomingView, { global: { stubs }, props: upcoming as any })

    expect(wrapper.find('[data-loan-upcoming-total]').text()).toBe('2850000 RUB')
    expect(wrapper.findAll('[data-loan-upcoming-group]').map(el => el.attributes('data-loan-upcoming-group'))).toEqual(['overdue', 'nearest'])
    expect(wrapper.findAll('[data-loan-upcoming-item]')).toHaveLength(3)
    expect(wrapper.text()).toContain('Principal 18000 / Interest 3000')
    expect(wrapper.text()).toContain('2500000 RUB')
  })

  it('emits the wallet id of the clicked row', async () => {
    const wrapper = mount(LoansUpcomingView, { global: { stubs }, props: upcoming as any })
    await wrapper.findAll('[data-loan-upcoming-item]')[2]!.trigger('click')
    expect(wrapper.emitted('select')).toEqual([['r2']])
  })

  it('shows a closed group by its title only and emits the toggle', async () => {
    const wrapper = mount(LoansUpcomingView, { global: { stubs }, props: { ...(upcoming as any), openKeys: [] } })
    expect(wrapper.findAll('[data-loan-upcoming-item]')).toHaveLength(2)
    wrapper.findComponent(stubs.UCollapsible).vm.$emit('update:open', true)
    expect(wrapper.emitted('toggle')).toEqual([['overdue', true]])
  })

  it('renders nothing without charges', () => {
    const wrapper = mount(LoansUpcomingView, { props: { baseCurrencyCode: 'RUB', groups: [], isOverdue: false, openKeys: [], total: null } })
    expect(wrapper.text()).toBe('')
  })
})
