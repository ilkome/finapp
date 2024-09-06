<script setup lang="ts"></script>

<template>
  <div
    class="
      cursor-pointer
      px-3 py-1
      flex min-h-[52px]
      items-center gap-3
      text-1
      bg-item-4 rounded-md
      hocus:bg-item-5 hocus:shadow-2xl hocus:scale-[1.02] hocus:z-10
      duration-200
    "
  >
    <slot />
  </div>
</template>
