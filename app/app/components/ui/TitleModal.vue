<script setup lang="ts">
// A close button is positioned by the host (UiButtonClose); `hasClose` keeps the row clear of it.
const props = defineProps<{
  hasClose?: boolean
  /** An entity icon before the title, in its color. */
  icon?: { color?: string, name: string }
  /** A floating title (over scrolled content) keeps a tighter bottom edge. */
  isCompact?: boolean
}>()

const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <div
    :class="cn(
      // The solid strip keeps content scrolled to the very top from showing through above the name.
      'sticky top-0 z-20 flex items-center gap-1 bg-default/90 px-3 pt-5 pb-4 font-tertiary text-lg leading-none font-semibold backdrop-blur before:absolute before:inset-x-0 before:top-0 before:-z-10 before:h-5 before:bg-default',
      props.isCompact && 'pb-1',
      props.hasClose && 'pr-11',
    )"
    @click="(e: Event) => emit('click', e)"
  >
    <UiIconBase v-if="props.icon" :name="props.icon.name" :color="props.icon.color" invert class="mr-1 shrink-0" />
    <div class="min-w-0 grow">
      <slot />
    </div>

    <!-- Icon buttons are taller than the title line; the negative margin keeps the row height. -->
    <div v-if="$slots.actions" class="-my-3 flex shrink-0 items-center gap-1">
      <slot name="actions" />
    </div>
  </div>
</template>
