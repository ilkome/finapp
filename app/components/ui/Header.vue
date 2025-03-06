<template>
  <div class="mb-2 grid max-w-7xl items-center border-b border-item-4 px-2 sm:min-h-14 lg:px-4 2xl:px-8">
    <div class="flex min-h-12 grow items-center gap-2 pl-1">
      <slot />

      <div v-if="$slots.actions" class="ml-auto flex items-center">
        <slot name="actions" />
      </div>
    </div>
    <div
      v-if="$slots.selected"
      class="grid"
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
</template>
