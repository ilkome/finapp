<script setup lang="ts">
const props = defineProps<{
  disabled?: boolean
  icon: string
  label: string
  loading?: boolean
  trailingIcon?: string
}>()

defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<template>
  <UButton
    class="w-full justify-start rounded-sm! data-[state=open]:bg-elevated/50!"
    color="neutral"
    :disabled="props.disabled"
    :icon="props.icon"
    :label="props.label"
    :loading="props.loading"
    size="sm"
    :trailingIcon="props.trailingIcon"
    variant="ghost"
    @click="$emit('click', $event)"
  />
</template>
