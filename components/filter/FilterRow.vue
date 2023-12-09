<script setup lang="ts">

</script>

<template lang="pug">
.grid.gap-3.overflow-hidden(
  class="grid-cols-[auto,1fr]"
)
  slot(name="add")
  .overflow-hidden.overflow-x-auto
    .flex.flex-wrap.gap-3
      slot(name="content")
</template>
