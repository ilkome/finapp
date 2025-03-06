<script setup lang="ts">
const props = defineProps<{
  isShown: boolean
  lineWidth?: number
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

    <div
      v-if="lineWidth && !isShown"
      class="mx-2 h-px bg-item-5 group-last:hidden"
      :class="{ 'ml-12': lineWidth === 3, 'ml-11': lineWidth === 2 }"
    />
  </div>
</template>
