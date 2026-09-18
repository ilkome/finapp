import type { Meta, StoryObj } from '@storybook/vue3-vite'

import SearchInput from './SearchInput.vue'

const meta = {
  args: { placeholder: 'Search' },
  component: SearchInput,
  title: 'ui/SearchInput',
} satisfies Meta<typeof SearchInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Large: Story = { args: { size: 'xl' } }
