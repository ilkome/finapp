import type { Meta, StoryObj } from '@storybook/vue3-vite'

import Input from './Input.vue'

const meta = {
  args: { modelValue: '', placeholder: 'Wallet name' },
  component: Input,
  title: 'form/Input',
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {}
export const Filled: Story = { args: { modelValue: 'Dollar card' } }
export const Number: Story = { args: { modelValue: 1520, type: 'number' } }
export const Color: Story = { args: { modelValue: '#3b82f6', type: 'color' } }
