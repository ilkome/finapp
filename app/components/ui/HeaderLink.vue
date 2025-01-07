<script setup lang="ts">
const props = defineProps<{
  icon?: string
}>()

const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <UiElement
    class="group/item"
    :lineWidth="4"
    insideClasses="min-h-[44px]"
    @click="e => emit('click', e)"
  >
    <template #leftIcon>
      <Icon
        v-if="props.icon"
        :name="props.icon"
        size="20"
        class="text-2"
      />
    </template>

    <slot />
  </UiElement>
</template>
