<script setup lang="ts">
import { useStorage } from '@vueuse/core'

const props = defineProps<{
  initStatus?: boolean
  storageKey?: string
}>()

const isShown = useStorage(`${props.storageKey}`, props.initStatus)
</script>

<template>
  <div v-if="$slots.header">
    <slot
      name="header"
      :isShown
      :toggle="() => isShown = !isShown"
    />
  </div>

  <div
    v-if="isShown && $slots.default"
  >
    <slot
      :toggle="() => isShown = !isShown"
    />
  </div>
</template>
