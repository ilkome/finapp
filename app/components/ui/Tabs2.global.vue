<script setup lang="ts">
import { cn } from '~~/lib/cn'
</script>

<template>
  <div :class="cn('overflow-hidden overflow-x-auto grow gap-x-1 flex items-center flex-nowrap')">
    <slot />
  </div>
</template>
