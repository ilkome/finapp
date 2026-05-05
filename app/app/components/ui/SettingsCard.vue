<script setup lang="ts">
defineProps<{
  danger?: boolean
  description?: string
  title: string
}>()
</script>

<template>
  <div>
    <div :class="cn($slots.default || $slots.footer ? 'pb-2' : 'pb-4')">
      <div class="border-default mb-2 border-b pb-2 text-lg font-semibold">
        {{ title }}
      </div>

      <div
        v-if="description"
        class="text-muted py-1 text-xs"
      >
        {{ description }}
      </div>
    </div>

    <div
      v-if="$slots.default"
      class="pb-4"
    >
      <slot />
    </div>

    <div
      v-if="$slots.footer"
      class="flex items-center pb-3"
    >
      <slot name="footer" />
    </div>
  </div>
</template>
