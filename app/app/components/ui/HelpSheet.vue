<script setup lang="ts">
defineProps<{
  title: string
}>()

defineEmits<{
  closed: []
}>()
</script>

<template>
  <BottomSheetModal @closed="$emit('closed')">
    <UiTitleModal>
      {{ title }}
    </UiTitleModal>

    <div class="bottomSheetContentInside grid gap-5 px-4 pb-8">
      <slot />
    </div>
  </BottomSheetModal>
</template>
