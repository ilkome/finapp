<script setup lang="ts">
// Space-reserving placeholder shown while local data is still hydrating: the first
// data paint replaces equal-height blocks instead of shifting the layout (CLS).
</script>

<template>
  <UiPage>
    <div class="grid gap-4 px-3 pt-3">
      <USkeleton class="h-8 w-40" />

      <USkeleton class="h-9 w-full max-w-72" />

      <USkeleton class="h-12 w-full" />

      <div class="grid grid-cols-3 gap-3">
        <USkeleton v-for="i in 3" :key="i" class="h-16" />
      </div>

      <USkeleton class="h-40 w-full" />

      <div class="grid gap-2 pt-2">
        <USkeleton v-for="i in 6" :key="i" class="h-12 w-full" />
      </div>
    </div>
  </UiPage>
</template>
