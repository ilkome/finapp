<script setup lang="ts">
defineProps<{
  ariaLabel: string
}>()
</script>

<template>
  <UiActionButton
    class="rounded-md! hover:bg-accented!"
    :ariaLabel
    @click.stop
  >
    <Icon name="lucide:ellipsis" size="18" />
  </UiActionButton>
</template>
