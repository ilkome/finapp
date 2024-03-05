<template lang="pug">
.cursor-pointer.group.w-10.h-10.flex-center.rounded-full.hocus-text-white.hocus_bg-accent-1(
  @click="$emit('click')"
)
  slot
</template>
