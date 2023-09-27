<template lang="pug">
div(tabindex="0"
  class=`
    cursor-pointer aspect-square
    max-w-[58px] grow w-full p-3 flex items-center justify-center
    text-2xl font-unica font-normal text-item-primary
    bg-item-main border border-item-border rounded-full
    hocus_bg-item-hover hocus_border[red] hocus_scale-[1.02]
    transition
  `
  @click="$emit('click')"
)
  slot
</template>
