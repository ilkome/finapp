<script setup lang="ts">
import { useStorage } from '@vueuse/core'

import { getStyles } from '~/components/ui/getStyles'

const props = defineProps<{
  initStatus?: boolean
  lineWidth?: number
  openPadding?: string
  storageKey?: string
}>()

const isShown = useStorage(`ui-toggle-${props.storageKey}`, props.initStatus)
</script>

<template>
  <div
    class="group relative"
    :class="{
      [props.openPadding]: props.openPadding && isShown,
    }"
  >
    <div class="-my-px overflow-hidden">
      <div
        :class="getStyles('item', ['link', 'center', 'rounded', 'minh1'])"
      >
        <slot
          name="header"
          :isShown
          :toggle="() => isShown = !isShown"
        />
      </div>

      <div v-if="isShown" class="">
        <slot
          :toggle="() => isShown = !isShown"
          :close="() => isShown = false"
        />
      </div>
    </div>

    <div
      v-if="lineWidth && !isShown"
      class="mx-2 h-px bg-[var(--item-5)] group-last:hidden"
      :class="{ 'ml-12': lineWidth === 3, 'ml-11': lineWidth === 2 }"
    />
  </div>
</template>
