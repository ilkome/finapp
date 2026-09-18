import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import FilterChipsView from '~/components/filter/ChipsView.vue'
import StatDateNavigationView from '~/components/stat/date/NavigationView.vue'
import chips from '~/components/stat/fixtures/chips.json'

const stubs = {
  CategoriesItem: { props: ['category'], template: '<div data-category @click="$emit(\'click\')">{{ category.name }}</div>' },
  WalletsItem: { props: ['wallet'], template: '<div data-wallet @click="$emit(\'click\')">{{ wallet.name }}</div>' },
}

describe('filterChipsView', () => {
  it('renders every chip kind and emits the removed chip', async () => {
    const wrapper = mount(FilterChipsView, { global: { stubs }, props: chips as any })
    expect(wrapper.text()).toContain('Dollar card')
    expect(wrapper.text()).toContain('Food')
    expect(wrapper.text()).toContain('Expense')
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('remove')?.[0]?.[0]).toMatchObject({ kind: 'extra', patch: { type: 'all' } })
    await wrapper.find('[data-wallet]').trigger('click')
    expect(wrapper.emitted('remove')?.[1]?.[0]).toMatchObject({ kind: 'wallet', walletId: 'card' })
  })
})

describe('statDateNavigationView', () => {
  it('shows only the arrows that can move and forwards the direction', async () => {
    const wrapper = mount(StatDateNavigationView, {
      props: { isEnd: true, isShowHome: true, isStart: false },
      slots: { range: '<span data-range>Last 14 days</span>' },
    })
    const buttons = wrapper.findAll('button')
    expect(buttons.map(b => b.attributes('aria-label'))).toEqual(['base.previous', 'base.reset'])
    await buttons[0]!.trigger('click')
    expect(wrapper.emitted('changeDate')).toEqual([['prev']])
    expect(wrapper.find('[data-range]').exists()).toBe(true)
  })
})
