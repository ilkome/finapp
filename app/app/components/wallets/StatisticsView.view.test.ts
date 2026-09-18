import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import fixture from '~/components/stat/fixtures/walletsStatistics.json'
import StatisticsView from '~/components/wallets/StatisticsView.vue'

const stubs = {
  UCollapsible: { props: ['open'], template: '<div><slot /><slot name="content" /></div>' },
  UiContextMenuMy: { template: '<div><slot /></div>' },
}

describe('walletsStatisticsView', () => {
  it('renders pins and rows, shows available/limit for a credit row, and emits the clicked id', async () => {
    const wrapper = mount(StatisticsView, { global: { stubs }, props: fixture as any })
    expect(wrapper.text()).toContain('Available')
    expect(wrapper.findAll('[data-amount]').map(el => el.text())).toContain('1580 USD')

    await wrapper.findAll('.uiElement')[1]!.trigger('click')
    expect(wrapper.emitted('click')).toEqual([['cash']])
  })

  it('hides the list when asked', () => {
    const wrapper = mount(StatisticsView, { global: { stubs }, props: { ...fixture, isShowList: false } as any })
    expect(wrapper.text()).not.toContain('statistics.title')
  })
})
