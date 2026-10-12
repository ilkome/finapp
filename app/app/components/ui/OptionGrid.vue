<script setup lang="ts" generic="T extends string | number">
const props = defineProps<{
  items: { label: string, value: T }[]
}>()

const model = defineModel<T>({ required: true })
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="item in props.items"
      :key="item.value"
      type="button"
      :aria-pressed="item.value === model"
      class="flex shrink-0 flex-col items-center gap-1 rounded-md interactive p-2 text-xs"
      :class="item.value === model ? 'bg-elevated text-default' : 'text-muted'"
      @click="model = item.value"
    >
      <slot name="swatch" :value="item.value" />
      {{ item.label }}
    </button>
  </div>
</template>
