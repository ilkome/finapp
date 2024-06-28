<script setup lang="ts">
import { classes } from '~/components/ui/getStyles'
</script>

<template>
  <div :class="[classes.item.base]">
    <slot />
  </div>
</template>
