<template lang="pug">
a.flex-center.py-3.px-5.rounded-md.hocus_bg-item-hover.transition(
  href="https://ilko.me"
)
  | {{ $t('app.madeBy.text') }}
  .mdi.mdi-heart.mx-2.heart.text-2xl(
    class=`
      animate-[heartbeat_3s_ease-in-out_infinite]
      text-[rgb(210,0,20)]
    `
  )
  | {{ $t('app.madeBy.name') }}
</template>

<style lang="stylus">
@keyframes heartbeat
  0%
    transform scale(.75)
  20%
    transform scale(1)
  40%
    transform scale(.75)
  60%
    transform scale(1.1)
  80%
    transform scale(.75)
  100%
    transform scale(.75)
</style>
