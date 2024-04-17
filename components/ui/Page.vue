<template lang="pug">
div(
  class=`
    overflow-x-hidden
    overflow-y-auto
    relative
    flex flex-col justify-between
    w-full
    pb-[52px]
    js_scroll_page
  `
)
  .max-w-5xl.lg_px-8
    slot

  .max-w-5xl
    slot(name="bottom")
</template>
