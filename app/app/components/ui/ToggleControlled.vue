<script setup lang="ts">
const props = defineProps<{
  isShown: boolean
}>()

const emit = defineEmits<{
  click: [value: boolean]
}>()
</script>

<template>
  <div>
    <div>
      <slot
        name="header"
        :isShown="props.isShown"
        :toggle="() => emit('click', !props.isShown)"
      />
    </div>

    <div v-if="isShown">
      <slot
        :toggle="() => emit('click', !props.isShown)"
      />
    </div>
  </div>
</template>
