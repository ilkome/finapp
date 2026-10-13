<script setup lang="ts">
// A close button is positioned by the host (UiButtonClose); `hasClose` keeps the row clear of it.
const props = defineProps<{
  hasClose?: boolean
}>()

const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <div
    :class="cn(
      'sticky top-0 z-20 flex items-center gap-1 bg-default/90 px-3 pt-5 pb-4 font-tertiary text-lg leading-none font-semibold backdrop-blur',
      props.hasClose && 'pr-11',
    )"
    @click="(e: Event) => emit('click', e)"
  >
    <div class="min-w-0 grow">
      <slot />
    </div>

    <!-- Icon buttons are taller than the title line; the negative margin keeps the row height. -->
    <div v-if="$slots.actions" class="-my-3 flex shrink-0 items-center gap-1">
      <slot name="actions" />
    </div>
  </div>
</template>
