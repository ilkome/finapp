import type { Meta, StoryObj } from '@storybook/vue3-vite'

import chips from '~/components/stat/fixtures/chips.json'

import ChipsView from './ChipsView.vue'

const meta = {
  args: chips as any,
  component: ChipsView,
  title: 'filter/ChipsView',
} satisfies Meta<typeof ChipsView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
