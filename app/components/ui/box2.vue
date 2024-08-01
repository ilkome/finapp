<script setup lang="ts">
import { getStyles } from '~/components/ui/getStyles'

const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <div
    :class="[getStyles('item', ['bg', 'padding3', 'center', 'minh', 'minw1', 'rounded'])]"
    class="grow grid gap-1 px-3 py-2"
    @click="(e: Event) => emit('click', e)"
  >
    <slot />
  </div>
</template>
