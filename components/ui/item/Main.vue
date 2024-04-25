<script setup lang="ts">
import { classes } from '~/components/ui/getStyles'
</script>

<template lang="pug">
div(:class="[classes.item.base]")
  slot
</template>
