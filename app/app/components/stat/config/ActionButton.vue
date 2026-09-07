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
    class="min-h-10 w-full justify-start gap-2 rounded-sm! py-1.5 pr-2 pl-3 text-sm font-normal hover:bg-elevated/50! data-[state=open]:bg-elevated/50!"
    color="neutral"
    :disabled="props.disabled"
    :icon="props.icon"
    :label="props.label"
    :loading="props.loading"
    :trailingIcon="props.trailingIcon"
    :ui="{ leadingIcon: 'size-5 text-muted', trailingIcon: 'size-4 text-muted' }"
    variant="ghost"
    @click="$emit('click', $event)"
  />
</template>
