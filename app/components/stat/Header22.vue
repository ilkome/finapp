<script setup lang="ts">
</script>

<template>
  <div class="statHeaderWrapper">
    <div class="grid max-w-5xl gap-2">
      <div class="flex gap-2">
        <div class="grid grow gap-2">
          <slot v-if="$slots.title" name="title" />

          <div v-if="$slots.menu" class="grow">
            <slot name="menu" />
          </div>
        </div>

        <div class="ml-auto flex items-center gap-2">
          <slot name="actions" />
        </div>
      </div>

      <div v-if="$slots.dateNavigation">
        <slot name="dateNavigation" />
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
      <slot />
    </div>
  </div>
</template>
