<template>
  <div class="mb-2 top-0 sticky z-20 bg-default/90 backdrop-blur">
    <div class="py-2 grid max-w-7xl items-center border-b border-item-4 min-h-12 px-2 lg:px-4 2xl:px-8 lg:py-4">
      <div class="flex grow items-center gap-2">
        <slot />

        <div v-if="$slots.actions" class="ml-auto flex items-center">
          <slot name="actions" />
        </div>
      </div>
      <div
        v-if="$slots.selected"
        class="grid -mb-2 lg:-mb-4"
      >
        <slot name="selected" />
      </div>
    </div>

    <div
      v-if="$slots.after"
      class="grid gap-2 pb-2 pt-1"
    >
      <slot name="after" />
    </div>
  </div>
</template>
