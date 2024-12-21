<script setup lang="ts">
import { getStyles } from '~/components/ui/getStyles'

defineProps<{
  isOpen?: boolean
  isShown?: boolean
}>()
const emit = defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <UiTitle1
    :class="getStyles('item', ['link', 'center', 'padding3', 'minh2', 'minw1', 'rounded'])"
    class="!text-3 !font-tertiary flex grow items-center gap-2 !pb-0 !text-lg !font-bold leading-none"
    @click="emit('click')"
  >
    <div><slot /></div>
  </UiTitle1>
</template>
