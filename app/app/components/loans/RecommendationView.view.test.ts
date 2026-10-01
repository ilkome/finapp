import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import recommendation from '~/components/demo/loans/recommendation.json'
import LoansRecommendationView from '~/components/loans/RecommendationView.vue'

describe('loansRecommendationView', () => {
  it('renders both strategies and the wallet picker behind its toggle', async () => {
    const wrapper = mount(LoansRecommendationView, { props: recommendation as any })

    expect(wrapper.find('[data-loan-pick="avalanche"]').text()).toContain('Mortgage')
    expect(wrapper.find('[data-loan-pick="snowball"]').text()).toContain('Car loan')
    expect(wrapper.find('[data-loan-pick="avalanche"] [data-amount]').text()).toBe('64200 RUB')

    expect(wrapper.find('[data-loan-free-wallet]').exists()).toBe(false)
    await wrapper.find('[data-loan-free-wallets-toggle]').trigger('click')
    const wallets = wrapper.findAll('[data-loan-free-wallet] [role="switch"]')
    expect(wallets).toHaveLength(2)
    expect(wallets[0]!.attributes('aria-checked')).toBe('true')
    expect(wallets[1]!.attributes('aria-checked')).toBe('false')
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('50000')
  })

  it('emits the wallet toggle and the extra amount', async () => {
    const wrapper = mount(LoansRecommendationView, { props: recommendation as any })
    await wrapper.find('[data-loan-free-wallets-toggle]').trigger('click')

    await wrapper.find('[data-loan-free-wallet="c2"] [role="switch"]').trigger('click')
    expect(wrapper.emitted('toggleWallet')).toEqual([['c2']])

    await wrapper.find('input').setValue('1000')
    expect(wrapper.emitted('update:extra')).toEqual([[1000]])

    await wrapper.find('[data-loan-extra-all]').trigger('click')
    expect(wrapper.emitted('update:extra')![1]).toEqual([Math.round(recommendation.freeMoney)])
  })

  it('falls back to a hint when there is nothing to recommend', () => {
    const wrapper = mount(LoansRecommendationView, { props: { ...recommendation, avalanche: null, snowball: null } as any })
    expect(wrapper.findAll('[data-loan-pick]')).toHaveLength(0)
    expect(wrapper.text()).toContain('loans.recommendation.empty')
  })
})
