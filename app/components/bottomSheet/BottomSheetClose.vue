<script setup lang="ts">
const emit = defineEmits<{
  onClick: [e: Event]
}>()
</script>

<template>
  <div
    class="absolute right-1 top-1 z-30 flex size-8 items-center justify-center rounded-full bg-item-4 transition ease-in-out hover:bg-item-hover"
    @click="(e: Event) => emit('onClick', e)"
  >
    <Icon
      name="lucide:x"
      color="text-2"
      size="22"
    />
  </div>
</template>
