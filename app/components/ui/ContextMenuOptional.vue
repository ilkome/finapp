<script setup lang="ts">
import type { ContextMenuItem } from '#ui/components/ContextMenu.vue'

const props = defineProps<{
  items?: ContextMenuItem[][]
}>()
</script>

<template>
  <UContextMenu v-if="props.items" :items="props.items">
    <slot />
  </UContextMenu>
  <slot v-else />
</template>
