<script setup lang="ts">

</script>

<template lang="pug">
.flex.flex.items-center.justify-between.gap-4.sticky.top-0.z-20.backdrop-blur(
  class="bg-white/70 dark_bg-dark3/70"
)
  slot

  .flex.gap-2.py-1.pr-0
    slot(name="actions")
</template>
