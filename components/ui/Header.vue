<template>
  <div
    class="bg-foreground-3 sticky top-0 z-20 backdrop-blur px-2 md:px-6"
  >
    <div class="flex min-h-[48px] items-center justify-between gap-4 md:max-w-xl">
      <slot />

      <div v-if="$slots.actions" class="flex gap-2 py-1">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>
