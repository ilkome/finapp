import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import schedule from '~/components/demo/loans/schedule.json'
import LoansScheduleView from '~/components/loans/ScheduleView.vue'

describe('loansScheduleView', () => {
  it('renders every row with its status dot', () => {
    const wrapper = mount(LoansScheduleView, { props: schedule as any })
    expect(wrapper.findAll('[data-loan-status]').map(el => el.attributes('data-loan-status')))
      .toEqual(['paid', 'partial', 'scheduled', 'scheduled'])
    expect(wrapper.findAll('[data-amount]').map(el => el.text())).toEqual([
      '12500 RUB',
      '12507.34 RUB',
      '12500 RUB',
      '0 RUB',
    ])
    expect(wrapper.findAll('[data-loan-principal-free]').map(el => el.attributes('data-loan-principal-free'))).toEqual(['holiday'])
  })

  it('expands a row into its parts, its delta and its actions', async () => {
    const wrapper = mount(LoansScheduleView, { props: schedule as any })
    await wrapper.find('[data-loan-row="2"]').trigger('click')

    expect(wrapper.find('[data-loan-delta]').text()).toContain('7.34')
    expect(wrapper.text()).toContain('loans.principal')
    expect(wrapper.text()).toContain('loans.pay')
    // Only rows stored as an override offer the reset.
    expect(wrapper.text()).not.toContain('loans.resetRow')

    const buttons = wrapper.findAll('button')
    await buttons.find(b => b.text() === 'loans.pay')!.trigger('click')
    expect(wrapper.emitted('pay')![0]![0]).toMatchObject({ paymentNumber: 2 })
    await buttons.find(b => b.text() === 'base.edit')!.trigger('click')
    expect(wrapper.emitted('edit')![0]![0]).toMatchObject({ paymentNumber: 2 })
  })

  it('emits resetRow only for a stored override', async () => {
    const wrapper = mount(LoansScheduleView, { props: schedule as any })
    await wrapper.find('[data-loan-row="1"]').trigger('click')
    await wrapper.findAll('button').find(b => b.text() === 'loans.resetRow')!.trigger('click')
    expect(wrapper.emitted('resetRow')).toEqual([[1]])
  })

  it('collapses around the first unpaid row and expands on demand', async () => {
    const rows = Array.from({ length: 30 }, (_, i) => ({
      amount: 100,
      canReset: false,
      date: `01.${String((i % 12) + 1).padStart(2, '0')}.2026`,
      delta: 0,
      fine: 0,
      interest: 10,
      isPayable: true,
      paymentNumber: i + 1,
      principal: 90,
      principalFree: null,
      status: i < 20 ? 'paid' : 'scheduled',
    }))
    const wrapper = mount(LoansScheduleView, { props: { currencyCode: 'RUB', firstUnpaidIndex: 20, rows } as any })

    expect(wrapper.findAll('[data-loan-row]')).toHaveLength(11)
    await wrapper.findAll('button').at(-1)!.trigger('click')
    expect(wrapper.findAll('[data-loan-row]')).toHaveLength(30)
  })
})
