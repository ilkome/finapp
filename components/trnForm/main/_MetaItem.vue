<template lang="pug">
div(class=`
  cursor-pointer
  px-3 py-2 flex gap-1 items-center
  border-1 rounded-lg
  text-primary/60 leading-none
  hocus_bg-item-hover
`)
  .text-xl.leading-none
    slot(name="icon")

  .text-xs.font-arial.text-left.leading-none
    slot
</template>
