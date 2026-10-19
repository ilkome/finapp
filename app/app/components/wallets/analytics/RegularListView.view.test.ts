import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import regular from '~/components/stat/fixtures/regularList.json'
import RegularListView from '~/components/wallets/analytics/RegularListView.vue'

const stubs = {
  UBadge: { template: '<span data-badge><slot /></span>' },
  USwitch: { emits: ['update:modelValue'], props: ['modelValue'], template: '<button data-switch :aria-checked="modelValue" @click="$emit(\'update:modelValue\', !modelValue)" />' },
}

describe('walletsAnalyticsRegularListView', () => {
  it('lists the regular categories with their total and folds the rest', async () => {
    const wrapper = mount(RegularListView, { global: { stubs }, props: regular as any })
    expect(wrapper.find('[data-regular-group="regular"]').text()).toContain('940 USD')
    expect(wrapper.find('[data-regular-item="gym"]').text()).toContain('Health')
    expect(wrapper.find('[data-regular-group="others"]').exists()).toBe(false)
    await wrapper.find('[data-regular-others-toggle]').trigger('click')
    expect(wrapper.find('[data-regular-item="travel"]').exists()).toBe(true)
  })

  it('emits toggle from the switch and edit from the row', async () => {
    const wrapper = mount(RegularListView, { global: { stubs }, props: regular as any })
    await wrapper.find('[data-regular-item="rent"] [data-switch]').trigger('click')
    expect(wrapper.emitted('toggle')).toEqual([['rent']])
    await wrapper.find('[data-regular-item="rent"]').trigger('click')
    expect(wrapper.emitted('edit')).toEqual([['rent']])
  })
})
