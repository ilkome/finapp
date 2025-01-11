<script setup lang="ts">
const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <UiElement
    class="@container/element"
    insideClasses="max-w-lg w-full !min-h-[44px] bg-item-4 px-2 @xs/element:pl-4 @xs/element:pr-3 block @xs/element:flex @xs/element:flex-wrap gap-0 gap-x-2"
    @click="(e: Event) => emit('click', e)"
  >
    <div class="text-sm text-2">
      <slot name="label" />
    </div>

    <div class="@xs/element:ml-auto flex items-center gap-1 text-base">
      <slot name="value" />
      <Icon
        name="lucide:chevron-down"
        class="text-item-2"
      />
    </div>
  </UiElement>
</template>
