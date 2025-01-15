<template>
  <div
    class="
      @container/page
      relative rounded-xl bg-item-5
      sm:border sm:border-item-3 sm:p-2 md:p-3 lg:p-4
    "
    style="padding-bottom: calc(50px + env(safe-area-inset-bottom))"
  >
    <slot />
  </div>
</template>
