<script setup lang="ts">
// Body of every description sheet, so the transaction form and bulk edit look the same.
const props = defineProps<{
  // The eraser stays visible on an empty field and emits `clearEmpty` (bulk: clear the selected descriptions).
  isClearableWhenEmpty?: boolean
  placeholder: string
}>()

const emit = defineEmits<{
  clearEmpty: []
}>()

const desc = defineModel<string>({ required: true })
</script>

<template>
  <div class="grid min-w-80 justify-items-start pb-6 md:pb-0">
    <FormTextarea
      v-model="desc"
      autoResize
      :placeholder="props.placeholder"
    />
    <UButton
      v-if="desc || props.isClearableWhenEmpty"
      type="button"
      class="mt-1"
      color="neutral"
      icon="i-lucide-eraser"
      size="md"
      variant="ghost"
      @click="desc ? desc = '' : emit('clearEmpty')"
    >
      {{ $t('base.clear') }}
    </UButton>
  </div>
</template>
