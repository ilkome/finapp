<template lang="pug">
div(
  class=`
    overflow-x-hidden
    overflow-y-auto
    relative
    flex flex-col justify-between
    w-full
    pb-[44px] md_pb-[52px] lg_pb-0
    js_scroll_page
  `
)
  .max-w-5xl.h-full.lg_px-8
    slot

  .max-w-5xl
    slot(name="bottom")
</template>
