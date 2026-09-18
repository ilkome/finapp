import type { Meta, StoryObj } from '@storybook/vue3-vite'

import ExpandableBlock from './ExpandableBlock.vue'

const meta = {
  args: { icon: 'lucide:bar-chart-3', title: 'Chart' },
  component: ExpandableBlock,
  render: args => ({
    components: { ExpandableBlock },
    setup: () => ({ args }),
    template: '<ExpandableBlock v-bind="args"><div class="px-3 py-2 text-sm text-muted">Block settings</div></ExpandableBlock>',
  }),
  title: 'stat/config/ExpandableBlock',
} satisfies Meta<typeof ExpandableBlock>

export default meta
type Story = StoryObj<typeof meta>

export const Collapsed: Story = {}
export const Expanded: Story = { args: { isExpanded: true } }
export const Sortable: Story = { args: { showSeparator: true, sortable: true } }
export const Compact: Story = { args: { compact: true } }
