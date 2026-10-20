<script setup lang="ts">
defineProps<{
  caption?: string
  title: string
}>()
</script>

<template>
  <div class="grid gap-1 border-t border-default pt-6 @3xl/page:col-span-2" data-analytics-group>
    <h2 class="px-2 text-lg font-semibold text-highlighted">
      {{ title }}
    </h2>
    <UiText v-if="caption" variant="meta" class="px-2">
      {{ caption }}
    </UiText>
  </div>
</template>
