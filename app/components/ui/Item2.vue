<script setup lang="ts">
import { getStyles } from '~/components/ui/getStyles'

const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <UiElement
    insideClasses="w-full !min-h-[44px] bg-item-4 px-2 @xl/page:px-4 block @xl/page:flex @xl/page:flex-wrap gap-0 gap-x-2"
    @click="(e: Event) => emit('click', e)"
  >
    <div class="text-2 text-sm">
      <slot name="label" />
    </div>

    <div class="@xl/page:ml-auto flex items-center gap-1 text-base">
      <slot name="value" />
      <Icon
        name="lucide:chevron-down"
        class="text-item-2"
      />
    </div>
  </UiElement>
</template>
