<script setup lang="ts">
const props = defineProps<{
  ariaLabel: string
}>()
</script>

<template>
  <button
    type="button"
    class="group/more relative flex size-10 shrink-0 cursor-default items-center justify-center"
    :aria-label="props.ariaLabel"
    @click.stop
  >
    <span class="more-button-bg absolute inset-1 rounded-sm transition-colors group-hover/more:bg-accented group-data-[state=open]/more:bg-accented" />
    <Icon name="lucide:ellipsis" class="relative" size="16" />
  </button>
</template>
