<template lang="pug">
.cursor-pointer.group.w-10.h-10.flex-center.rounded-full.hocus-text-white.hocus_bg-skin-accent-base(
  @click="$emit('click')"
)
  slot
</template>
