import type { Meta, StoryObj } from '@storybook/vue3-vite'

import SortableList from './SortableList.vue'

const meta = {
  args: { ids: ['card', 'cash', 'savings'] },
  component: SortableList,
  render: args => ({
    components: { SortableList },
    setup: () => ({ args }),
    template: `<SortableList v-bind="args" class="grid gap-1">
      <template #default="{ id }">
        <div class="flex items-center gap-2 rounded-md bg-elevated/30 px-3 py-2">
          <span class="sortHandle cursor-grab text-muted">⋮⋮</span>{{ id }}
        </div>
      </template>
    </SortableList>`,
  }),
  title: 'wallets/SortableList',
} satisfies Meta<typeof SortableList>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
