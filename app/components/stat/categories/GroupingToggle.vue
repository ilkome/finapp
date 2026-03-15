<script setup lang="ts">
const props = defineProps<{
  isGrouped: boolean
  size?: string
}>()

const emit = defineEmits<{
  toggle: []
}>()
</script>

<template>
  <UiActionButton
    :ariaLabel="$t('base.toggleGrouping')"
    :isActive="props.isGrouped"
    :size="props.size"
    @click="emit('toggle')"
  >
    <Icon
      :name="props.isGrouped ? 'lucide:network' : 'lucide:folder-tree'"
      :size="20"
    />
  </UiActionButton>
</template>
