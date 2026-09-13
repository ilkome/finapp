<script setup lang="ts">
import { useDragAndDrop } from '@formkit/drag-and-drop/vue'

// Drag reorder over any id list; rows drag only by their `.sortHandle`, so hosts toggle sorting
// by showing or hiding the handle.
const props = defineProps<{
  ids: string[]
}>()

const emit = defineEmits<{
  update: [ids: string[]]
}>()

// A unique group keeps nested lists from swapping items into each other.
const [parent, sorted] = useDragAndDrop([...props.ids], {
  dragHandle: '.sortHandle',
  group: useId(),
})

watch(sorted, (ids) => {
  if (ids.some((id, index) => id !== props.ids[index]))
    emit('update', [...ids])
})

// Only a changed set re-seeds the list; re-seeding on every prop change would undo the drag
// that caused it.
watch(() => props.ids, (ids) => {
  const sameSet = ids.length === sorted.value.length && ids.every(id => sorted.value.includes(id))
  if (!sameSet)
    sorted.value = [...ids]
})
</script>

<template>
  <div ref="parent">
    <slot
      v-for="id in sorted"
      :id="id"
      :key="id"
    />
  </div>
</template>
