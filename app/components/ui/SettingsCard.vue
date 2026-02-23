<script setup lang="ts">
defineProps<{
  danger?: boolean
  description?: string
  title: string
}>()
</script>

<template>
  <div
    :class="cn('overflow-hidden rounded-lg border', danger ? 'border-alert-1/30' : 'border-item-6')"
  >
    <div :class="cn('px-4 pt-4', $slots.default || $slots.content || $slots.footer ? 'pb-2' : 'pb-4')">
      <div class="text-lg font-semibold">
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
      class="px-4 pb-4"
    >
      <slot />
    </div>

    <div
      v-if="$slots.content"
      class="px-4 pb-4"
    >
      <slot name="content" />
    </div>

    <div
      v-if="$slots.footer"
      :class="cn('flex items-center border-t px-4 py-3', danger ? 'border-alert-1/30' : 'border-item-6')"
    >
      <slot name="footer" />
    </div>
  </div>
</template>
