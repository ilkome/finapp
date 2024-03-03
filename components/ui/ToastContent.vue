<script setup lang="ts">
defineProps<{
  data: {
    title?: string
    description?: string
  }
}>()
</script>

<template>
  <div class="grid gap-3">
    <div v-if="data.title" class="text-5xl">
      {{ data.title }}
    </div>
    <div v-if="data.description" class="text-sm">
      {{ data.description }}
    </div>
  </div>
</template>
