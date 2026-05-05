<script setup lang="ts">
const props = defineProps<{
  checkboxValue: boolean
  title: string
}>()

const emit = defineEmits<{
  click: [e: boolean]
}>()

function handleClick() {
  emit('click', props.checkboxValue)
}
</script>

<template>
  <div
    class="hover:bg-elevated/50 flex grow items-center gap-3 rounded-sm p-2 text-sm"
    @click="handleClick"
  >
    <FormSwitch :value="checkboxValue" />

    <div class="text-muted grow">
      {{ title }}
    </div>
  </div>
</template>
