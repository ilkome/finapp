<script setup lang="ts">
import { cn } from '~~/lib/cn'
</script>

<template>
  <div :class="cn('@container/tabs overflow-hidden overflow-x-auto grow gap-x-1 flex items-center flex-wrap')">
    <slot />
  </div>
</template>
