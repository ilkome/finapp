<script setup lang="ts">
const props = defineProps<{
  busy?: boolean
  checkboxValue: boolean
  disabled?: boolean
  title: string
  trailing?: boolean
}>()

const emit = defineEmits<{
  click: [e: boolean]
}>()

function handleClick() {
  if (props.busy || props.disabled)
    return
  emit('click', props.checkboxValue)
}
</script>

<template>
  <div
    :aria-disabled="disabled || undefined"
    :class="cn(
      'flex grow items-center gap-3 rounded-sm py-2 pr-2 pl-3 text-sm hover:bg-elevated/50',
      busy && 'pointer-events-none opacity-60',
      disabled && 'pointer-events-none opacity-50',
      trailing && 'flex-row-reverse',
    )"
    @click="handleClick"
  >
    <Icon v-if="busy" name="lucide:loader-circle" class="size-5 animate-spin text-muted" />
    <FormSwitch v-else :value="checkboxValue" />

    <div class="grow text-muted">
      {{ title }}
    </div>
  </div>
</template>
