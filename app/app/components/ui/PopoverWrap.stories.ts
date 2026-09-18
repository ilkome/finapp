import type { Meta, StoryObj } from '@storybook/vue3-vite'

import PopoverWrap from './PopoverWrap.vue'

const meta = {
  args: { title: 'Options' },
  component: PopoverWrap,
  render: args => ({
    components: { PopoverWrap },
    setup: () => ({ args }),
    template: `<div class="w-72 rounded-md bg-elevated/30"><PopoverWrap v-bind="args"><div class="p-3 text-sm">Popover body</div></PopoverWrap></div>`,
  }),
  title: 'ui/PopoverWrap',
} satisfies Meta<typeof PopoverWrap>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const WithClose: Story = { args: { isShowCloseBtn: true } }
