<script setup lang="ts">
const props = defineProps<{
  column: any
  label: string
}>()

const sorted = computed(() => props.column.getIsSorted())
</script>

<template>
  <div class="group/header relative flex min-w-0 items-center">
    <button
      type="button"
      class="flex min-w-0 flex-1 items-center gap-1.5 py-1 text-left font-medium text-muted hover:text-highlighted"
      @click="props.column.toggleSorting(sorted === 'asc')"
    >
      <span class="truncate">{{ props.label }}</span>
      <Icon
        v-if="sorted"
        :name="sorted === 'asc' ? 'lucide:arrow-up' : 'lucide:arrow-down'"
        size="14"
      />
      <Icon v-else name="lucide:arrow-up-down" class="opacity-0 group-hover/header:opacity-60" size="13" />
    </button>

    <button
      v-if="props.column.getCanResize()"
      type="button"
      :aria-label="$t('trns.historyTable.columns.resize')"
      class="absolute inset-y-0 -right-2 z-10 w-3 cursor-col-resize touch-none select-none"
      @dblclick="props.column.resetSize()"
      @mousedown="props.column.getResizeHandler()($event)"
      @touchstart="props.column.getResizeHandler()($event)"
    >
      <span class="mx-auto block h-full w-px bg-transparent group-hover/header:bg-accented" />
    </button>
  </div>
</template>
