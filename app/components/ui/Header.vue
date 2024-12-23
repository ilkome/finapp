<template>
  <div class="bg-foreground-3/80 border-b-foreground-1 sticky top-0 z-20 border-b-2 px-2 py-1 backdrop-blur lg:px-4 2xl:px-8">
    <div class="flex max-w-5xl items-center gap-2">
      <slot />

      <div v-if="$slots.actions" class="ml-auto flex items-center gap-1">
        <slot name="actions" />
      </div>
    </div>

    <div
      v-if="$slots.selected"
      class="py-1"
    >
      <slot name="selected" />
    </div>
  </div>

  <div
    v-if="$slots.after"
    class="grid gap-2 pb-2"
  >
    <slot name="after" />
  </div>
</template>
