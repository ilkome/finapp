<script setup lang="ts">
import { getStyles } from '~/components/ui/getStyles'

const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <div
    :class="[getStyles('item', ['bg', 'link', 'padding3', 'center', 'minh', 'minw1', 'rounded'])]"
    class="text-1 grid grow gap-1 px-3 py-2"
    @click="(e: Event) => emit('click', e)"
  >
    <slot />
  </div>
</template>
