<script setup lang="ts">
import { getStyles } from '~/components/ui/getStyles'

const emit = defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <UiTitle
    :class="getStyles('item', ['link', 'center', 'padding3', 'minh2', 'minw1', 'rounded'])"
    class="!text-3 !font-tertiary flex grow items-center gap-2 pb-0 !text-base !font-semibold leading-none"
    @click="emit('click')"
  >
    <slot />
  </UiTitle>
</template>
