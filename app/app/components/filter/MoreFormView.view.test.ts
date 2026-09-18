import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { defaultFilterExtras } from '~/components/filter/extras'
import MoreFormView from '~/components/filter/MoreFormView.vue'

const props = {
  amountCurrencySymbol: '$',
  descItems: [{ label: 'All', value: 'all' }, { label: 'With', value: 'with' }],
  modelValue: defaultFilterExtras,
  typeItems: [{ label: 'All', value: 'all' }, { label: 'Expense', value: 'expense' }],
} as any

const stubs = { UInput: { props: ['modelValue'], template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)">' } }

describe('filterMoreFormView', () => {
  it('patches the model without dropping the other fields', async () => {
    const wrapper = mount(MoreFormView, { global: { stubs }, props })
    const inputs = wrapper.findAll('input')

    await inputs[0]!.setValue('coffee')
    expect(wrapper.emitted('update:modelValue')!.at(-1)![0]).toEqual({ ...defaultFilterExtras, descText: 'coffee' })

    await inputs[1]!.setValue('10')
    expect(wrapper.emitted('update:modelValue')!.at(-1)![0]).toMatchObject({ amountMin: 10 })
  })

  it('reads an empty or unparsable amount back as null', async () => {
    const wrapper = mount(MoreFormView, { global: { stubs }, props: { ...props, modelValue: { ...defaultFilterExtras, amountMin: 10 } } })
    await wrapper.findAll('input')[1]!.setValue('')
    expect(wrapper.emitted('update:modelValue')!.at(-1)![0]).toMatchObject({ amountMin: null })
  })
})
