<script setup lang="ts">
const props = defineProps<{
  isShown?: boolean
}>()
const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <div
    class="interactive flex min-h-[38px] min-w-[42px] grow items-center gap-2 rounded-sm px-3 pb-0"
    @click="emit('click')"
  >
    <Icon
      :name="props.isShown ? 'lucide:chevron-down' : 'lucide:chevron-right'"
      size="22"
      class="!text-muted -ml-1"
    />
    <slot />
  </div>
</template>
