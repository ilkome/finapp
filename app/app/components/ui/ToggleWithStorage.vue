<script setup lang="ts">
import { useStorage } from '@vueuse/core'

const props = defineProps<{
  initStatus?: boolean
  lineWidth?: number
  storageKey?: string
}>()

const isShown = useStorage(`ui-toggle-${props.storageKey}`, props.initStatus)
</script>

<template>
  <div
    class="group relative"
  >
    <div class="-my-px overflow-hidden">
      <div
        class="interactive flex min-h-[42px] items-center rounded-sm"
      >
        <slot
          name="header"
          :isShown
          :toggle="() => isShown = !isShown"
        />
      </div>

      <div v-if="isShown">
        <slot
          :toggle="() => isShown = !isShown"
          :close="() => isShown = false"
        />
      </div>
    </div>

    <div
      v-if="lineWidth && !isShown"
      :class="cn('mx-2 h-px bg-elevated group-last:hidden',
                 lineWidth === 3 && 'ml-12',
                 lineWidth === 2 && 'ml-11',
      )"
    />
  </div>
</template>
