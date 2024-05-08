<script setup lang="ts">
import { getStyles } from '~/components/ui/getStyles'

const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <div
    :class="[
      ...getStyles('item', ['link', 'center', 'rounded', 'padding1', 'minh2']),
    ]"
    @click="e => emit('click', e)"
  >
    <slot />
  </div>
</template>
