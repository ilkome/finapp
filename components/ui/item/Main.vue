<script setup lang="ts">
import { classes } from '~/components/ui/classes'
</script>

<template lang="pug">
div(:class="[classes.item.base]")
  slot
</template>
