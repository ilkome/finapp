import type { Meta, StoryObj } from '@storybook/vue3-vite'

import ContextMenuMy from './ContextMenuMy.vue'

const meta = {
  args: { items: [[{ icon: 'i-lucide-pencil', label: 'Edit' }, { icon: 'i-lucide-trash', label: 'Delete' }]] },
  component: ContextMenuMy,
  render: args => ({
    components: { ContextMenuMy },
    setup: () => ({ args }),
    template: `<ContextMenuMy v-bind="args"><div class="rounded-md bg-elevated/30 p-6 text-sm">Right click or long press</div></ContextMenuMy>`,
  }),
  title: 'ui/ContextMenuMy',
} satisfies Meta<typeof ContextMenuMy>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
