<script setup lang="ts">
import { getStyles } from '~/components/ui/getStyles'

const emit = defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <UiTitle
    :class="getStyles('item', ['-link', 'center', 'minh2', 'minw1', 'rounded'])"
    class="grow flex items-center gap-2 pb-0 !text-3 !text-base !font-semibold !font-tertiary leading-none"
    @click="emit('click')"
  >
    <slot />
  </UiTitle>
</template>
