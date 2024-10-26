<template>
  <div class="bg-foreground-1 sticky top-0 z-20 px-2 md:gap-12 md:px-6">
    <div class="flex min-h-[44px] items-center justify-between gap-4 md:max-w-xl">
      <slot />

      <div v-if="$slots.actions" class="flex gap-2 py-1">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>
