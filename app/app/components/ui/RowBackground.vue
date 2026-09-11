<script setup lang="ts">
export type RowBackgroundType = 'category' | 'none' | 'standard'

const props = defineProps<{
  color?: string
  type?: RowBackgroundType
}>()

const isShow = computed(() => !!props.type && props.type !== 'none')
</script>

<template>
  <div
    class="relative"
    :class="{
      'overflow-hidden rounded-md': isShow,
      'bg-elevated/10 hover:bg-elevated/30': isShow && props.type === 'category',
      'bg-elevated/30 hover:bg-elevated/50': isShow && props.type === 'standard',
    }"
  >
    <div
      v-if="isShow && props.type === 'category'"
      :style="{ backgroundColor: props.color }"
      class="pointer-events-none absolute inset-0 opacity-5"
    />

    <slot />
  </div>
</template>
