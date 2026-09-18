import type { Meta, StoryObj } from '@storybook/vue3-vite'

import ButtonWithRight from './ButtonWithRight.vue'

const meta = {
  component: ButtonWithRight,
  render: args => ({
    components: { ButtonWithRight },
    setup: () => ({ args }),
    template: `<ButtonWithRight v-bind="args"><template #label>Currency</template><template #value>USD</template></ButtonWithRight>`,
  }),
  title: 'ui/ButtonWithRight',
} satisfies Meta<typeof ButtonWithRight>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
