import type { Meta, StoryObj } from '@storybook/vue3-vite'

import Page from './Page.vue'

const meta = {
  component: Page,
  render: args => ({
    components: { Page },
    setup: () => ({ args }),
    template: `<Page v-bind="args"><div class="p-4 text-sm">Page content</div></Page>`,
  }),
  title: 'ui/Page',
} satisfies Meta<typeof Page>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
