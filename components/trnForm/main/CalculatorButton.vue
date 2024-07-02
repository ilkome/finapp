<template lang="html">
  <div
    class="
      grow flex items-center justify-center
      aspect-square w-full max-w-[54px] p-1
      rounded-full border border-item-6
      font-unica  font-normal text-xl text-item-primary
      bg-item-main
      hocus:bg-item-5 hocus:border-item-6 hocus:scale-[1.02]
      transition
    "
    tabindex="0"
    @click="$emit('click')"
  >
    <slot />
  </div>
</template>
