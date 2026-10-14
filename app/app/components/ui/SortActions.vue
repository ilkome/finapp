<script setup lang="ts">
// Header actions while a list is in drag-sort mode: they replace the page's usual icons.
const emit = defineEmits<{
  apply: []
  cancel: []
}>()
</script>

<template>
  <div class="flex items-center gap-2">
    <UButton
      color="neutral"
      :label="$t('base.cancel')"
      size="lg"
      variant="ghost"
      @click="emit('cancel')"
    />
    <UButton
      :label="$t('base.apply')"
      size="lg"
      @click="emit('apply')"
    />
  </div>
</template>
