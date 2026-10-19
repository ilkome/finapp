import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import preview from '~/components/stat/fixtures/analyticsPreview.json'
import PreviewView from '~/components/wallets/analytics/PreviewView.vue'

describe('walletsAnalyticsPreviewView', () => {
  it('draws the sparkline, the change and the runway, and opens on click', async () => {
    const wrapper = mount(PreviewView, { props: preview as any })
    expect(wrapper.find('path').attributes('d')).toMatch(/^M0\.00,/)
    expect(wrapper.text()).toContain('-400 USD')
    expect(wrapper.find('[data-preview-runway]').text()).toContain('7 months')
    await wrapper.find('[data-analytics-preview]').trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('skips the sparkline without enough points', () => {
    const wrapper = mount(PreviewView, { props: { ...preview, points: [1] } as any })
    expect(wrapper.find('svg').exists()).toBe(false)
  })
})
