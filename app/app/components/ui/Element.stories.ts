import type { Meta, StoryObj } from '@storybook/vue3-vite'

import Element from './Element.vue'

const meta = {
  component: Element,
  render: args => ({
    components: { Element },
    setup: () => ({ args }),
    template: `<Element v-bind="args"><template v-if="args.insideClasses" #leftIcon><Icon name="lucide:wallet" /></template>Row content</Element>`,
  }),
  title: 'ui/Element',
} satisfies Meta<typeof Element>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Active: Story = { args: { isActive: true } }
export const WithLeftIcon: Story = { args: { insideClasses: 'min-h-11!' } }
