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
      class="flex min-h-10.5 shrink-0 items-center gap-2 rounded-md bg-elevated/30 px-4 text-sm ring ring-inset hover:bg-elevated/50"
      :class="item.value === model ? 'text-highlighted ring-2 ring-primary' : 'text-muted ring-accented'"
      @click="model = item.value"
    >
      <slot name="swatch" :value="item.value" />
      {{ item.label }}
    </button>
  </div>
</template>
