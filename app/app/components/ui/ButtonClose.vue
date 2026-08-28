<script setup lang="ts">
const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <button
    type="button"
    :aria-label="$t('base.close')"
    class="absolute top-1 right-1 z-30 flex size-8 cursor-default items-center justify-center rounded-full bg-elevated transition ease-in-out hover:bg-elevated/50"
    @click="(e: Event) => emit('click', e)"
  >
    <Icon
      name="lucide:x"
      class="text-muted light:text-inverted"
      size="22"
    />
  </button>
</template>
