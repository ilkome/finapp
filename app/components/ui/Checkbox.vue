<script setup lang="ts">
const props = defineProps<{
  checkboxValue: boolean
  title: string
}>()

const emit = defineEmits<{
  onClick: [e: boolean]
  onClose: []
}>()

function handleClick() {
  emit('onClick', props.checkboxValue)
  emit('onClose')
}
</script>

<template>
  <div
    class="hocus:bg-item-5 flex grow items-center gap-3 rounded-lg p-2 text-sm"
    @click="handleClick"
  >
    <SharedInputsCheckbox
      v-if="checkboxValue !== undefined"
      :value="checkboxValue"
    />

    <div class="text-secondary grow">
      {{ title }}
    </div>
  </div>
</template>
