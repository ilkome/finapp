import type { Meta, StoryObj } from '@storybook/vue3-vite'

import { defaultFilterExtras } from '~/components/filter/extras'

import MoreFormView from './MoreFormView.vue'

const meta = {
  args: {
    amountCurrencySymbol: '$',
    descItems: [
      { label: 'All descriptions', value: 'all' },
      { label: 'With description', value: 'with' },
      { label: 'Without description', value: 'without' },
    ],
    modelValue: defaultFilterExtras,
    typeItems: [
      { label: 'All types', value: 'all' },
      { label: 'Expense', value: 'expense' },
      { label: 'Income', value: 'income' },
      { label: 'Transfer', value: 'transfer' },
    ],
  } as any,
  component: MoreFormView,
  title: 'filter/MoreFormView',
} satisfies Meta<typeof MoreFormView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Filled: Story = {
  args: { modelValue: { ...defaultFilterExtras, amountMax: 500, amountMin: 10, desc: 'with', descText: 'coffee', type: 'expense' } } as any,
}
