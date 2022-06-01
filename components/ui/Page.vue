<template lang="pug">
.relative.overflow-x-hidden.overflow-y-auto.flex.flex-col.justify-between.w-full.h-full(
  class="md_pb-[52px] pb-[44px] lg_pb-0"
)
  .max-w-3xl
    slot

  .max-w-3xl
    slot(name="bottom")
</template>
