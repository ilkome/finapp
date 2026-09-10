<script setup lang="ts">
import { useDragAndDrop } from '@formkit/drag-and-drop/vue'

const props = defineProps<{
  hiddenIds?: string[]
  items: { hint?: string, id: string, title: string }[]
  pinnedIds?: string[]
  showHide?: boolean
  showPin?: boolean
}>()

const emit = defineEmits<{
  toggleHidden: [id: string]
  togglePinned: [id: string]
  update: [ids: string[]]
}>()

const [parent, sorted] = useDragAndDrop([...props.items], {
  dragHandle: '.sortHandle',
})

watch(sorted, items => emit('update', items.map(item => item.id)))

// Pinning a row while the panel is open changes which rows belong here. Only a changed set
// re-seeds the list - re-seeding on every prop change would undo the drag that caused it.
watch(() => props.items, (items) => {
  const sameSet = items.length === sorted.value.length
    && items.every(item => sorted.value.some(row => row.id === item.id))

  if (!sameSet)
    sorted.value = [...items]
})

const cellClasses = 'flex w-10 shrink-0 items-center justify-center self-stretch text-muted hover:bg-accented'
</script>

<template>
  <div ref="parent" class="grid">
    <div
      v-for="item in sorted"
      :key="item.id"
      class="flex min-h-11 items-center overflow-hidden rounded-sm text-sm hover:bg-elevated/50"
      :class="props.hiddenIds?.includes(item.id) && 'opacity-50'"
    >
      <div
        class="sortHandle cursor-grab active:cursor-grabbing" :class="[cellClasses]"
        :aria-label="$t('base.sort')"
      >
        <Icon name="lucide:grip-vertical" size="20" />
      </div>

      <div class="grow truncate">
        {{ item.title }}
      </div>

      <button
        v-if="props.showPin"
        type="button"
        :class="cellClasses"
        :aria-label="props.pinnedIds?.includes(item.id) ? $t('base.unpin') : $t('base.pin')"
        @click="emit('togglePinned', item.id)"
      >
        <Icon
          :name="props.pinnedIds?.includes(item.id) ? 'lucide:pin-off' : 'lucide:pin'"
          size="18"
        />
      </button>

      <button
        v-if="props.showHide"
        type="button"
        :class="cellClasses"
        :aria-label="props.hiddenIds?.includes(item.id) ? $t('base.show') : $t('base.hide')"
        @click="emit('toggleHidden', item.id)"
      >
        <Icon
          :name="props.hiddenIds?.includes(item.id) ? 'lucide:eye-off' : 'lucide:eye'"
          size="18"
        />
      </button>
    </div>
  </div>
</template>
