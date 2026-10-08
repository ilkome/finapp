import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import draft from '~/components/demo/loans/scheduleRowDraft.json'
import LoansScheduleRowForm from '~/components/loans/ScheduleRowForm.vue'

// FormDate pulls in the real calendar popover (UCalendar/BottomSheetOrDropdown); a pure View
// test only needs to see the value it renders and that it can emit an update.
const FormDateStub = {
  emits: ['update:modelValue'],
  props: ['modelValue'],
  template: '<input data-form-date :value="modelValue" @input="$emit(\'update:modelValue\', Number($event.target.value))">',
}

function mountForm(props = draft as any) {
  return mount(LoansScheduleRowForm, {
    global: { stubs: { FormDate: FormDateStub } },
    props,
  })
}

describe('loansScheduleRowForm', () => {
  it('renders the draft fields from plain JSON', () => {
    const wrapper = mountForm()
    expect(wrapper.find('[data-form-date]').attributes('value')).toBe(String(draft.modelValue.date))

    const inputs = wrapper.findAll('input[type="number"]')
    expect(inputs.map(input => (input.element as HTMLInputElement).value)).toEqual([
      String(draft.modelValue.principalPart),
      String(draft.modelValue.interestPart),
      String(draft.modelValue.fine),
    ])
  })

  it('emits update:modelValue when a field changes, and save/cancel on click', async () => {
    const wrapper = mountForm()

    await wrapper.findAll('input[type="number"]')[0]!.setValue('3000')
    expect(wrapper.emitted('update:modelValue')![0]![0]).toEqual({ ...draft.modelValue, principalPart: 3000 })

    const buttons = wrapper.findAll('button')
    await buttons[0]!.trigger('click')
    expect(wrapper.emitted('save')).toHaveLength(1)

    await buttons[1]!.trigger('click')
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })
})
