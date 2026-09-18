import type { Meta, StoryObj } from '@storybook/vue3-vite'

import PanelBack from './PanelBack.vue'

const meta = {
  args: { title: 'Chart settings' },
  component: PanelBack,
  title: 'ui/PanelBack',
} satisfies Meta<typeof PanelBack>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
