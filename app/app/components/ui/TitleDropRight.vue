<script setup lang="ts">
import { onLongPress } from '@vueuse/core'

const props = defineProps<{
  // Nested groups drop the toned color so they read under their parent.
  /** Title reads as an alert (overdue and the like). */
  isError?: boolean
  isNested?: boolean
  isShown?: boolean
  title?: string
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
    class="flex min-h-9.5 min-w-10.5 grow items-center gap-1 rounded-md interactive px-3 pb-0"
    role="button"
    tabindex="0"
    :aria-expanded="props.isShown"
    @click="onClick"
    @keydown.self.enter.space.prevent="(e: KeyboardEvent) => (e.currentTarget as HTMLElement).click()"
  >
    <div
      v-if="props.title"
      class="font-tertiary text-base leading-none font-semibold"
      :class="props.isError ? 'text-error!' : !props.isNested && 'text-toned!'"
    >
      {{ props.title }}
    </div>
    <slot />

    <Icon
      :name="props.isShown ? 'lucide:chevron-down' : 'lucide:chevron-right'"
      size="18"
      class="shrink-0 text-muted"
    />

    <slot name="after" />
  </div>
</template>
