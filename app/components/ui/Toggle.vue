<script setup lang="ts">
const props = defineProps<{
  initStatus?: boolean
  openPadding?: string
  storageKey?: string
}>()

const isShown = useStorage(`${props.storageKey}`, props.initStatus)
</script>

<template>
  <div>
    <div>
      <slot
        name="header"
        :isShown
        :toggle="() => isShown = !isShown"
      />
    </div>

    <div
      v-if="isShown"
      :class="[props.openPadding]"
    >
      <slot
        :toggle="() => isShown = !isShown"
      />
    </div>
  </div>
</template>
