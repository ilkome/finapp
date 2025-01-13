<script setup lang="ts">
import { getStyles } from '~/components/ui/getStyles'

const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <div
    :class="getStyles('item', ['link', 'alt', 'padding1', 'center', 'minh2', 'minw1', 'rounded'])"
    class="grow justify-center text-sm"
    @click="(e: Event) => emit('click', e)"
  >
    <slot />
  </div>
</template>
