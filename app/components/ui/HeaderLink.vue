<script setup lang="ts">
import { getStyles } from '~/components/ui/getStyles'

const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <div
    :class="[
      getStyles('item', ['bg', 'link', 'center', 'rounded', 'padding1', 'minh2']),
    ]"
    @click="(e: Event) => emit('click', e)"
  >
    <slot />
  </div>
</template>
