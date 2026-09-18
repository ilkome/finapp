import type { Meta, StoryObj } from '@storybook/vue3-vite'

import SettingsCard from './SettingsCard.vue'

const meta = {
  args: { description: 'Choose how amounts are displayed', title: 'Display' },
  component: SettingsCard,
  render: args => ({
    components: { SettingsCard },
    setup: () => ({ args }),
    template: `<SettingsCard v-bind="args"><div class="text-sm">Card body</div><template #footer><span class="text-xs text-muted">Footer</span></template></SettingsCard>`,
  }),
  title: 'ui/SettingsCard',
} satisfies Meta<typeof SettingsCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Danger: Story = { args: { danger: true } }
