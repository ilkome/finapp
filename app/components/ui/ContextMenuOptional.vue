<script setup lang="ts">
const props = defineProps<{
  items?: any[][]
}>()
</script>

<template>
  <UContextMenu v-if="props.items" :items="props.items">
    <slot />
  </UContextMenu>
  <slot v-else />
</template>
