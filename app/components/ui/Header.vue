<template>
  <div class="@lg:pt-3 max-w-7xl px-2 pb-2 pt-1 lg:px-4 2xl:px-8">
    <div class="flex items-center gap-2">
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
    class="grid gap-2 pb-1"
  >
    <slot name="after" />
  </div>
</template>
