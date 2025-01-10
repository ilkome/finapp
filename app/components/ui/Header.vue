<template>
  <div class="border-item-3 mb-2 flex min-h-12 max-w-7xl items-center border-b px-2 py-1 sm:min-h-14 lg:px-4 2xl:px-8">
    <div class="flex grow items-center gap-2">
      <slot />

      <div v-if="$slots.actions" class="ml-auto flex items-center">
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
    class="grid gap-2 pb-1"
  >
    <slot name="after" />
  </div>
</template>
