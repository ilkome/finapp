import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import whatIf from '~/components/demo/loans/whatIf.json'
import LoansWhatIfView from '~/components/loans/WhatIfView.vue'

describe('loansWhatIfView', () => {
  it('renders the saving and the new end date', () => {
    const wrapper = mount(LoansWhatIfView, { props: whatIf as any })
    expect(wrapper.find('[data-amount]').text()).toBe('64200 RUB')
    expect(wrapper.text()).toContain('01.02.2030')
  })

  it('emits the extra amount and the mode', async () => {
    const wrapper = mount(LoansWhatIfView, { props: whatIf as any })
    await wrapper.find('input').setValue('1000')
    expect(wrapper.emitted('update:extra')).toEqual([[1000]])

    await wrapper.find('[data-loan-mode="reducePayment"]').trigger('click')
    expect(wrapper.emitted('update:mode')).toEqual([['reducePayment']])
  })
})
