<script setup lang="ts">
</script>

<template>
  <div class="bg-foreground-3 sticky top-0 z-20 grid max-w-6xl gap-2 p-2 lg:px-4 xl:py-2">
    <div class="flex gap-2">
      <slot name="title" />

      <div class="ml-auto flex items-center gap-2">
        <slot name="actions" />
      </div>
    </div>

    <div
      v-if="$slots.filterSelector || $slots.filterSelected"
      class="grid gap-2"
    >
      <div
        v-if="$slots.filterSelector"
        class="flex items-center gap-1 overflow-x-auto"
      >
        <slot name="filterSelector" />
      </div>

      <slot name="filterSelected" />
    </div>
  </div>
</template>
