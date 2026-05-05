<script setup lang="ts">
const props = defineProps<{
  max?: number
  min?: number
  modelValue: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

function update(value: number) {
  if (props.min !== undefined && value < props.min)
    return
  if (props.max !== undefined && value > props.max)
    return
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="flex gap-1">
    <UiChipButton
      :class="[{ '!hover:transparent opacity-30': props.min !== undefined && props.modelValue <= props.min }]"
      @click="update(props.modelValue - 1)"
    >
      <Icon name="lucide:minus" />
    </UiChipButton>

    <FormInput
      :modelValue="props.modelValue"
      :min="props.min"
      class="!w-16 max-w-24 !px-2 text-center"
      type="number"
      @update:modelValue="value => update(+value)"
    />

    <UiChipButton
      :class="[{ '!hover:transparent opacity-30': props.max !== undefined && props.modelValue >= props.max }]"
      @click="update(props.modelValue + 1)"
    >
      <Icon name="lucide:plus" />
    </UiChipButton>
  </div>
</template>
