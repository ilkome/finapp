<script setup lang="ts">
import type { TotalCategory } from '~/components/stat/useNewStat'

const props = defineProps<{
  cats: TotalCategory[]
}>()
</script>

<template>
  <div>
    <slot name="contentBefore" />

    <div v-if="props.cats.length > 0">
      <slot />
    </div>
  </div>
</template>
