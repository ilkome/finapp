import type { Meta, StoryObj } from '@storybook/vue3-vite'

import NavigationView from './NavigationView.vue'

const meta = {
  args: { isEnd: false, isShowHome: true, isStart: false },
  component: NavigationView,
  title: 'stat/date/NavigationView',
} satisfies Meta<typeof NavigationView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const AtStart: Story = { args: { isStart: true } as any }
export const NoArrows: Story = { args: { isShowArrows: false } as any }
