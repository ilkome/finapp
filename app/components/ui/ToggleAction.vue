<script setup lang="ts">
import { getStyles } from '~/components/ui/getStyles'

const props = defineProps<{
  isShown: boolean
}>()

const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <div
    :class="getStyles('item', ['link', 'minh4', 'minw1', 'center2', 'rounded'])"
    class="z-10 !min-h-[44px]"
    @click="(e: Event) => emit('click', e)"
  >
    <Icon
      :name="props.isShown ? 'mdi:chevron-down' : 'mdi:chevron-right'"
      size="22"
    />
  </div>
</template>
