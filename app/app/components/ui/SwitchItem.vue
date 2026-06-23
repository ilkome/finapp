<script setup lang="ts">
const props = defineProps<{
  checkboxValue: boolean
  title: string
  busy?: boolean
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
      'hover:bg-elevated/50 flex grow items-center gap-3 rounded-sm p-2 text-sm',
      busy && 'pointer-events-none opacity-60',
    )"
    @click="handleClick"
  >
    <Icon v-if="busy" name="lucide:loader-circle" class="text-muted size-5 animate-spin" />
    <FormSwitch v-else :value="checkboxValue" />

    <div class="text-muted grow">
      {{ title }}
    </div>
  </div>
</template>
