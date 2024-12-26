<script setup lang="ts">
const props = defineProps<{
  checkboxValue: boolean
  title: string
}>()

const emit = defineEmits<{
  click: [e: boolean]
  onClose: []
}>()

function handleClick() {
  emit('click', props.checkboxValue)
  emit('onClose')
}
</script>

<template>
  <div
    class="hocus:bg-item-5 flex grow items-center gap-3 rounded-lg p-2 text-sm"
    @click="handleClick"
  >
    <FormSwitch
      v-if="checkboxValue !== undefined"
      :value="checkboxValue"
    />

    <div class="text-2 grow">
      {{ title }}
    </div>
  </div>
</template>
