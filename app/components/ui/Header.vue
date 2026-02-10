<template>
  <div class="bg-default/90 sticky top-0 z-20 mb-2 backdrop-blur">
    <div class="border-item-4 grid min-h-12 max-w-7xl items-center border-b px-2 py-2 lg:px-4 lg:py-4">
      <div class="flex grow items-center gap-2">
        <slot />

        <div v-if="$slots.actions" class="ml-auto flex items-center">
          <slot name="actions" />
        </div>
      </div>

      <div
        v-if="$slots.selected"
        class="-mb-2 grid lg:-mb-4"
      >
        <slot name="selected" />
      </div>
    </div>

    <div
      v-if="$slots.after"
      class="grid gap-2 pt-1 pb-2"
    >
      <slot name="after" />
    </div>
  </div>
</template>
