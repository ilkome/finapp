<script setup lang="ts">

</script>

<template lang="pug">
.flex
  slot

  .flex.gap-3.py-4.pr-3
    slot(name="actions")
</template>
