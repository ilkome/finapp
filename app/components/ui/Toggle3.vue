<script setup lang="ts">
const props = defineProps<{
  isShown: boolean
  openPadding?: string
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

    <div
      v-if="isShown"
      :class="[props.openPadding]"
    >
      <slot
        :toggle="() => emit('click', !props.isShown)"
      />
    </div>
  </div>
</template>
