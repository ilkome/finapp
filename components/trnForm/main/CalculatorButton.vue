<template lang="html">
  <div
    tabindex="0"
    class="bg-item-main _border-transparent hocus_border[red] _transition flex aspect-square w-full max-w-[58px] grow items-center justify-center border border-item-4 p-3 font-unica text-2xl font-normal text-secondary hocus_scale-[1.02] hocus_bg-item-7"
    @click="$emit('click')"
  >
    <slot />
  </div>
</template>
