<script setup lang="ts">
defineProps<{
  title: string
}>()

const row = useTemplateRef<HTMLElement>('row')

function openSelect(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (target.closest('[role="combobox"], button[data-slot="base"]'))
    return

  row.value?.querySelector<HTMLElement>('[role="combobox"], button[data-slot="base"]')?.click()
}
</script>

<template>
  <div ref="row" class="flex cursor-pointer items-center gap-3 rounded-sm py-2 pr-2 pl-3 text-sm hover:bg-elevated/50" @click="openSelect">
    <div class="min-w-0 grow text-muted">
      {{ title }}
    </div>
    <slot />
  </div>
</template>
