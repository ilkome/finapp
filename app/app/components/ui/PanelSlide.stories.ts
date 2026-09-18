import type { Meta, StoryObj } from '@storybook/vue3-vite'

import PanelSlide from './PanelSlide.vue'

const meta = {
  args: { direction: 1, panelKey: 'one' },
  component: PanelSlide,
  render: args => ({
    components: { PanelSlide },
    setup: () => ({ args }),
    template: `<PanelSlide v-bind="args"><div class="p-4 text-sm">Panel {{ args.panelKey }}</div></PanelSlide>`,
  }),
  title: 'ui/PanelSlide',
} satisfies Meta<typeof PanelSlide>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
