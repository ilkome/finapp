<script setup lang="ts">
const props = defineProps<{
  hasSelection?: boolean
  icon: string
  labelMode?: boolean
  title: string
}>()
</script>

<template>
  <UiHeaderLink
    v-if="props.labelMode"
    :icon="props.icon"
  >
    {{ props.title }}
  </UiHeaderLink>

  <UTooltip
    v-else
    :text="props.title"
  >
    <UChip
      v-if="props.hasSelection !== undefined"
      :show="props.hasSelection"
      color="secondary"
      inset
      size="xs"
    >
      <UiActionButton :ariaLabel="props.title">
        <Icon :name="props.icon" size="20" />
      </UiActionButton>
    </UChip>

    <UiActionButton
      v-else
      :ariaLabel="props.title"
    >
      <Icon :name="props.icon" size="20" />
    </UiActionButton>
  </UTooltip>
</template>
