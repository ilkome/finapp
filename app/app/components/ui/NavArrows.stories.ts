import type { Meta, StoryObj } from '@storybook/vue3-vite'

import NavArrows from './NavArrows.vue'

const meta = {
  args: { isEnd: false, isShowNavHome: true, isStart: false },
  component: NavArrows,
  title: 'ui/NavArrows',
} satisfies Meta<typeof NavArrows>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const AtStart: Story = { args: { isStart: true } }
export const Compact: Story = { args: { compact: true, hideInactiveArrows: true } }
