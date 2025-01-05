<script setup lang="ts">
import { getStyles } from '~/components/ui/getStyles'

const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <div
    :class="[getStyles('item', ['center', 'minh1', 'minw1'])]"
    class="grid grow gap-1"
    @click="(e: Event) => emit('click', e)"
  >
    <slot />
  </div>
</template>
