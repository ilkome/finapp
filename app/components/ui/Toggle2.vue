<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { getStyles } from '~/components/ui/getStyles'

const props = defineProps<{
  initStatus?: boolean
  isPadding?: boolean
  lineWidth?: number
  openPadding?: string
  storageKey?: string
}>()

const isShown = useStorage(`ui-toggle-${props.storageKey}`, props.initStatus)
</script>

<template>
  <div class="relative group" :class="{ [props.openPadding]: props.openPadding && isShown }">
    <div class="-my-[1px] overflow-hidden">
      <div
        :class="getStyles('item', ['link', 'center', 'rounded'])"
      >
        <slot
          name="header"
          :isShown
          :toggle="() => isShown = !isShown"
        />
      </div>

      <div v-if="isShown" class="px-3 rounded-xl">
        <slot
          :toggle="() => isShown = !isShown"
          :close="() => isShown = false"
        />
      </div>
    </div>

    <div
      v-if="lineWidth && !isShown"
      class="mx-2 h-[1px] bg-item-5 group-last:hidden"
      :class="{ 'ml-12': lineWidth === 3, 'ml-11': lineWidth === 2 }"
    />
  </div>
</template>
