<script setup lang="ts">
const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <div>
    <UiElement
      class="@container/element"
      insideClasses="max-w-lg w-full !min-h-[42px] bg-elevated/30 hover:bg-elevated/50 rounded-md px-4 @xs/element:pr-3 block @xs/element:flex @xs/element:flex-wrap gap-0 gap-x-2"
      @click="(e: Event) => emit('click', e)"
    >
      <div class="text-muted text-sm">
        <slot name="label" />
      </div>

      <div class="flex items-center gap-1 text-base @xs/element:ml-auto">
        <slot name="value" />
        <Icon
          name="lucide:chevron-down"
          class="text-muted"
        />
      </div>
    </UiElement>
  </div>
</template>
