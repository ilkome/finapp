<template>
  <div
    class="bg-foreground-3 sticky top-0 z-20 flex min-h-[48px] items-center justify-between gap-4 backdrop-blur"
  >
    <slot />

    <div v-if="$slots.actions" class="flex gap-2 py-1 pr-2">
      <slot name="actions" />
    </div>
  </div>
</template>
