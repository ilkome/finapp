<script setup lang="ts">
import { getStyles } from '~/components/ui/getStyles'

const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <div
    :class="getStyles('item', ['link', '_alt', 'center', 'minh2', 'minw4', 'rounded'])"
    class="justify-center text-xl"
    @click="(e: Event) => emit('click', e)"
  >
    <slot />
  </div>
</template>
