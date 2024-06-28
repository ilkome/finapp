<template lang="html">
  <div
    tabindex="0"
    class="bg-item-main rounded-full _border-transparent hocus:border[red] _transition flex aspect-square w-full max-w-[58px] grow items-center justify-center border border-item-4 p-2 font-unica text-2xl font-normal text-secondary hocus:scale-[1.02] hocus:bg-item-7"
    @click="$emit('click')"
  >
    <slot />
  </div>
</template>
