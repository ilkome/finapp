import type { Meta, StoryObj } from '@storybook/vue3-vite'

import Textarea from './Textarea.vue'

const meta = {
  args: { modelValue: '', placeholder: 'Description' },
  component: Textarea,
  title: 'form/Textarea',
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {}
export const AutoResize: Story = { args: { autoResize: true, modelValue: 'Weekly groceries\nand a coffee\nand a cake' } }
