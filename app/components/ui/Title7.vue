<script setup lang="ts">
import { getStyles } from '~/components/ui/getStyles'

const emit = defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <UiTitle
    :class="getStyles('item', ['link', 'center', 'padding3', 'minh2', 'minw1', 'rounded'])"
    class="grow flex items-center gap-2 pb-0 !text-3 !text-sm !font-semibold !font-tertiary"
    @click="emit('click')"
  >
    <slot />
  </UiTitle>
</template>
