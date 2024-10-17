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
      hover:bg-item-5 hover:shadow-2xl hover:scale-[1.02] hover:z-10
      duration-200
    "
  >
    <slot />
  </div>
</template>
