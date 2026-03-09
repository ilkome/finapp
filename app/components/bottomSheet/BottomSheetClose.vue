<script setup lang="ts">
const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <button
    type="button"
    :aria-label="$t('base.close')"
    class="bg-item-3 absolute top-1 right-1 z-30 flex size-8 cursor-default items-center justify-center rounded-full transition ease-in-out hover:bg-(--item-5)"
    @click="(e: Event) => emit('click', e)"
  >
    <Icon
      name="lucide:x"
      color="text-muted"
      size="22"
    />
  </button>
</template>
