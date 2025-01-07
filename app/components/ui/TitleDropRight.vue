<script setup lang="ts">
import { getStyles } from '~/components/ui/getStyles'

const props = defineProps<{
  isShown?: boolean
}>()
const emit = defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <div
    :class="getStyles('item', ['link', 'center', 'padding3', 'minh2', 'minw1', 'rounded'])"
    class="flex grow items-center gap-2 pb-0 font-tertiary text-base font-semibold leading-none !text-3"
    @click="emit('click')"
  >
    <Icon
      :name="props.isShown ? 'lucide:chevron-down' : 'lucide:chevron-right'"
      size="22"
      class="-ml-1"
    />
    <div><slot /></div>
  </div>
</template>
