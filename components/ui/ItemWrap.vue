<script setup lang="ts">

</script>

<template lang="pug">
div(
  class=`
    cursor-pointer
    py-1 px-3 min-h-[52px]
    flex items-center gap-3
    text-primary
    bg-item-main hocus_bg-item-hover
    rounded-md
    hocus_shadow-2xl hocus_scale-[1.02] hocus_z-10
    duration-200
  `
)
  slot
</template>
