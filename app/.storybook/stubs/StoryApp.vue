<script setup lang="ts">
// Nuxt UI overlays (tooltip, popover) inject providers that `UApp` sets up in the real app.
// An SFC so the Nuxt UI component resolver wires `UApp` the same way it does for the app.
</script>

<template>
  <UApp class="bg-default p-2 text-default">
    <slot />
  </UApp>
</template>
