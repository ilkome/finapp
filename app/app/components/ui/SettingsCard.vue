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
      <!-- Same face as the category block titles (UiTitleDropRight). -->
      <UiTitleSection class="mb-2 block text-toned!">
        {{ title }}
      </UiTitleSection>

      <div
        v-if="description"
        class="py-1 text-xs text-muted"
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
