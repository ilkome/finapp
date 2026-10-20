import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import bankCheck from '~/components/stat/fixtures/analyticsBankCheck.json'
import BankCheckView from '~/components/wallets/analytics/BankCheckView.vue'

describe('walletsAnalyticsBankCheckView', () => {
  it('lists mismatched wallets and opens one', async () => {
    const wrapper = mount(BankCheckView, { props: bankCheck as any })
    expect(wrapper.findAll('[data-bank-row]')).toHaveLength(2)
    expect(wrapper.text()).toContain('12 Oct')
    await wrapper.find('[data-bank-row="card"]').trigger('click')
    expect(wrapper.emitted('select')).toEqual([['card']])
  })
})
