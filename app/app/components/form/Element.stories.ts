import type { Meta, StoryObj } from '@storybook/vue3-vite'

import Element from './Element.vue'

const meta = {
  component: Element,
  render: () => ({
    components: { Element },
    template: '<Element><template #label>Currency</template><div class="text-sm">USD</div></Element>',
  }),
  title: 'form/Element',
} satisfies Meta<typeof Element>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
