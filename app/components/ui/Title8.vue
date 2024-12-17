<script setup lang="ts">
import { getStyles } from '~/components/ui/getStyles'

const props = defineProps<{
  isOpen?: boolean
  isShown?: boolean
}>()
const emit = defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <UiTitle
    :class="getStyles('item', ['link', 'center', 'padding3', 'minh2', 'minw1', 'rounded'])"
    class="!text-3 !font-tertiary !text-md flex grow items-center gap-2 pb-0 !font-bold leading-none"
    @click="emit('click')"
  >
    <div><slot /></div>
    <Icon
      v-if="!props.isShown"
      name="lucide:chevron-left"
      size="22"
      class="-ml-1"
    />
  </UiTitle>
</template>
