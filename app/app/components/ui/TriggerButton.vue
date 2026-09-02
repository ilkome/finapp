<script setup lang="ts">
const props = defineProps<{
  hasSelection?: boolean
  icon: string
  isActive?: boolean
  labelMode?: boolean
  outlined?: boolean
  title: string
}>()

const emit = defineEmits<{
  click: [e: Event]
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
      <UiActionButton
        :ariaLabel="props.title"
        :isActive="props.isActive"
        :class="props.outlined && 'border border-(--ui-bg-elevated)/50'"
        @click="emit('click', $event)"
      >
        <Icon :name="props.icon" :class="props.isActive && 'text-primary'" size="20" />
      </UiActionButton>
    </UChip>

    <UiActionButton
      v-else
      :ariaLabel="props.title"
      :isActive="props.isActive"
      :class="props.outlined && 'border border-(--ui-bg-elevated)/50'"
      @click="emit('click', $event)"
    >
      <Icon :name="props.icon" :class="props.isActive && 'text-primary'" size="20" />
    </UiActionButton>
  </UTooltip>
</template>
