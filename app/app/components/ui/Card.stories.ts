import type { Meta, StoryObj } from '@storybook/vue3-vite'

import Card from './Card.vue'

const meta = {
  component: Card,
  render: args => ({
    components: { Card },
    setup: () => ({ args }),
    template: `<Card v-bind="args"><div class="text-base font-semibold">12 500 ₽</div></Card>`,
  }),
  title: 'ui/Card',
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Static: Story = { args: { title: 'Balance' } }
export const Button: Story = { args: { as: 'button', chevron: 'more', title: 'Start balance' } }
export const Link: Story = { args: { chevron: 'right', title: 'Due this month', to: '/loans' } }
