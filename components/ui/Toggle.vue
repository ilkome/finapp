<script setup lang="ts">
import { useStorage } from '@vueuse/core'

const props = defineProps<{
  storageKey?: string
}>()

const isShown = useStorage(`ui-toggle-${props.storageKey}`, true)
</script>

<template>
  <div>
    <slot
      name="header"
      :isShown
      :toggle="() => isShown = !isShown"
    />

    <div v-if="isShown">
      <slot />
    </div>
  </div>
</template>
