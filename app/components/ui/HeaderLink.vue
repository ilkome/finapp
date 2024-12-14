<script setup lang="ts">
import { getStyles } from '~/components/ui/getStyles'

const props = defineProps<{
  icon?: string
}>()

const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <UiElement
    :lineWidth="2"
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
