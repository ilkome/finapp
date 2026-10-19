import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import BankReportsFormView from '~/components/bankReports/FormView.vue'
import fixture from '~/components/stat/fixtures/bankReport.json'

// FormDate pulls in the real calendar popover; the View test only needs its value and an update.
const FormDateStub = {
  emits: ['update:modelValue'],
  props: ['modelValue'],
  template: '<input data-form-date :value="modelValue ?? \'\'" @input="$emit(\'update:modelValue\', Number($event.target.value))">',
}

function mountView(props: Record<string, unknown>) {
  return mount(BankReportsFormView, {
    global: { stubs: { FormDate: FormDateStub } },
    props: props as any,
  })
}

const groups = (wrapper: ReturnType<typeof mountView>) => wrapper.findAll('[data-group]').map(group => group.attributes('data-group'))

describe('bankReportsFormView', () => {
  it('shows the balance and the card fields for a credit card, and saves them back unchanged', async () => {
    const wrapper = mountView(fixture.card)
    expect(groups(wrapper)).toEqual(['balance', 'card'])
    expect((wrapper.find('input[data-field="minPaymentAmount"]').element as HTMLInputElement).value).toBe('50')

    await wrapper.find('[data-action="save"]').trigger('click')
    expect(wrapper.emitted('save')![0]![0]).toEqual(fixture.card.report)
  })

  it('shows the loan fields for a loan and parses a typed amount into minor units', async () => {
    const wrapper = mountView(fixture.loan)
    expect(groups(wrapper)).toEqual(['balance', 'loan'])

    await wrapper.find('input[data-field="nextInterestAmount"]').setValue('130,5')
    await wrapper.find('[data-action="save"]').trigger('click')
    expect(wrapper.emitted('save')![0]![0]).toEqual({ ...fixture.loan.report, nextInterestAmount: 13050 })
  })

  it('shows only the balance for a plain wallet, and emits clear', async () => {
    const wrapper = mountView(fixture.plain)
    expect(groups(wrapper)).toEqual(['balance'])

    await wrapper.find('input[data-field="balanceAmount"]').setValue('')
    await wrapper.find('[data-action="save"]').trigger('click')
    expect(wrapper.emitted('save')![0]![0]).toEqual({ balanceDate: fixture.plain.report.balanceDate })

    await wrapper.find('[data-action="clear"]').trigger('click')
    expect(wrapper.emitted('clear')).toHaveLength(1)
  })

  it('hides the card fields behind the loans flag', () => {
    expect(groups(mountView({ ...fixture.card, isCreditShown: false }))).toEqual(['balance'])
  })
  it('shows an error under the field it belongs to', () => {
    const wrapper = mountView({ ...fixture.card, errors: { balanceDate: 'required', minPaymentAmount: 'negative' } })
    expect(wrapper.findAll('[data-error]').map(e => e.attributes('data-error'))).toEqual(['balanceDate', 'minPaymentAmount'])
  })
})
