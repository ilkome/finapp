<script setup lang="ts">
import { onLongPress } from '@vueuse/core'

const props = defineProps<{
  isShown?: boolean
}>()
const emit = defineEmits<{
  click: []
  longPress: []
}>()

const root = useTemplateRef<HTMLElement>('root')
// The click that ends a held press must not also toggle the group.
let isLongPressed = false
onLongPress(root, () => {
  isLongPressed = true
  emit('longPress')
})

function onClick() {
  if (isLongPressed) {
    isLongPressed = false
    return
  }
  emit('click')
}
</script>

<template>
  <div
    ref="root"
    class="flex min-h-9.5 min-w-10.5 grow items-center gap-1 rounded-sm interactive px-3 pb-0"
    @click="onClick"
  >
    <slot />

    <Icon
      :name="props.isShown ? 'lucide:chevron-down' : 'lucide:chevron-right'"
      size="18"
      class="shrink-0 text-muted"
    />

    <slot name="after" />
  </div>
</template>
