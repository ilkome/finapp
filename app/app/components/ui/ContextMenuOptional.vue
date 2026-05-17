<script setup lang="ts">
import type { ContextMenuItem } from '#ui/components/ContextMenu.vue'

const props = defineProps<{
  items?: ContextMenuItem[][]
}>()
</script>

<template>
  <UiContextMenuMy v-if="props.items" :items="props.items">
    <slot />
  </UiContextMenuMy>
  <slot v-else />
</template>
