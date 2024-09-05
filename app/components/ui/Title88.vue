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
  <UiTitle
    :class="getStyles('item', ['link', 'center', 'padding3', 'minw1', 'rounded'])"
    class="!min-h-[44px] grow flex items-center gap-2 pb-0 !text-3 !text-base !font-semibold !font-nunito leading-none"
    @click="emit('click')"
  >
    <div><slot /></div>
    <Icon
      v-if="!props.isShown"
      name="mdi:chevron-down"
      size="22"
      class="-ml-1"
    />
  </UiTitle>
</template>
