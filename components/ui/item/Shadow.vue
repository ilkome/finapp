<script setup lang="ts">
import { getStyles } from '~/components/ui/classes'

const emit = defineEmits<{
  (e: 'click'): void
}>()
</script>

<template lang="pug">
div(
  :class="getStyles('item', ['bg', 'link', 'rounded', 'shadow'])"
  @click="emit('click')"
)
  slot
</template>
