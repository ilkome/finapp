<script setup lang="ts">
defineProps<{
  isShowText: boolean
}>()

const emit = defineEmits<{
  (e: 'click'): void
}>()
</script>

<template lang="pug">
FilterItemBg(@click="emit('click')")
  .mdi.mdi-plus.text-2xl
  .text-sm.leading-none(v-if="isShowText") {{ $t('categories.createNewTitle') }}
</template>
