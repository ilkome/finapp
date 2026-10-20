<script setup lang="ts">
// The bottom bar of a UiSheet. A collapsed drawer is as tall as its top snap point and hangs its bleed
// below the screen, so on a phone the bar cancels the snap offset and the live drag to stay at the
// screen bottom; on release it eases with the drawer's own transition, so the two still add up to zero.
// The sheet body needs bottom padding for the bar on a phone.
const isLaptop = useIsLaptop()
</script>

<template>
  <div
    v-if="isLaptop"
    class="sticky bottom-0 z-10 grid gap-2 bg-default px-[10%] pt-2"
  >
    <slot />
  </div>
  <div
    v-else
    class="absolute inset-x-0 z-10 grid gap-2 bg-default px-[10%] pt-2 transition-transform duration-450 ease-[cubic-bezier(0.32,0.72,0,1)] group-data-[swiping]/drawer:transition-none"
    :style="{
      bottom: 'var(--bleed, 0px)',
      paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
      transform: 'translateY(calc(-1 * (var(--drawer-snap-lift, 0px) + var(--drawer-swipe-lift, 0px))))',
    }"
  >
    <slot />
  </div>
</template>
