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
    class="flex grow gap-3 items-center rounded-lg px-2 py-2 text-sm hocus:bg-item-5"
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
