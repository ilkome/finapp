<template>
  <div
    class="
      @container/page
      bg-foreground-1 sm:border-item-5 relative
      rounded-xl sm:border sm:p-2 md:p-3 lg:p-4
    "
    style="padding-bottom: calc(50px + env(safe-area-inset-bottom))"
  >
    <slot />
  </div>
</template>
