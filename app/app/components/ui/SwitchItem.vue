<script setup lang="ts">
const props = defineProps<{
  busy?: boolean
  checkboxValue: boolean
  title: string
}>()

const emit = defineEmits<{
  click: [e: boolean]
}>()

function handleClick() {
  if (props.busy)
    return
  emit('click', props.checkboxValue)
}
</script>

<template>
  <div
    :class="cn(
      'flex grow items-center gap-3 rounded-sm p-2 text-sm hover:bg-elevated/50',
      busy && 'pointer-events-none opacity-60',
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
