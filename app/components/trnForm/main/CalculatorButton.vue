<template>
  <div
    class="
      grow flex items-center justify-center
      aspect-square w-full max-w-[64px] md:max-w-[44px] p-1
      rounded-full border border-item-6
      font-secondary font-normal text-2xl text-5
      bg-item-4
      hocus:bg-item-5 hocus:border-item-6 hocus:scale-[1.02]
      transition
    "
    tabindex="0"
    @click="$emit('click')"
  >
    <slot />
  </div>
</template>
