<script setup lang="ts">
import { useStorage } from '@vueuse/core'

const props = defineProps<{
  initStatus?: boolean
  isPadding?: boolean
  storageKey?: string
}>()

const isShown = useStorage(`ui-toggle-${props.storageKey}`, props.initStatus)
</script>

<template>
  <div>
    <div
      class="md:max-w-lg"
    >
      <slot
        name="header"
        :isShown
        :toggle="() => isShown = !isShown"
      />
    </div>

    <div
      v-if="isShown"
      :class="{ 'pb-8 sm:pb-10': props.isPadding }"
    >
      <slot />
    </div>
  </div>
</template>
